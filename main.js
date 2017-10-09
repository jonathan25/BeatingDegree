var ctx
var fuzzyDegreeChart
window.onload = function() {
    ctx = document.getElementById("fuzzyDegreeChart").getContext('2d');
    fuzzyDegreeChart = new Chart(ctx, {
        type: 'scatter',
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }],
                xAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            },
            responsive: true
        }
    });
    loadData()
    $("#button-refresh").click(function() {
        loadData()
    })
}
function loadData() {
    const MAX_DIFFERENCE = 50
    var levels = ["not bad", "bad", "really bad", "awful", "rekt"]
    $.ajax({
        url: "http://www.nfl.com/liveupdate/scorestrip/ss.xml",
        type: "GET",
        dataType: "xml",
        success: function (response) {
            var games = []
            $(response).find("g").each(function() {
                if ($(this).attr("q") != "P") {
                    var hs = parseInt($(this).attr("hs"))
                    var vs = parseInt($(this).attr("vs"))
                    if (hs != vs) {
                        var difference = Math.abs(hs - vs)
                        var fuzzyBeatDegree = difference / MAX_DIFFERENCE
                        var crispDegreeLevel = (fuzzyBeatDegree * MAX_DIFFERENCE) / 10.0
                        if (crispDegreeLevel < 1) {
                            crispDegreeLevel = 1
                        } else if (crispDegreeLevel > 5) {
                            crispDegreeLevel = 5
                        } else {
                            crispDegreeLevel = Math.round(crispDegreeLevel)
                        }
                        var loser
                        if (hs > vs)
                            loser = $(this).attr("vnn")
                        else 
                            loser = $(this).attr("hnn")
                        var game = {
                            home : $(this).attr("hnn"),
                            visitor : $(this).attr("vnn"),
                            homeScore : hs,
                            visitorScore: vs,
                            loser : loser,
                            fuzzyBeatDegree: fuzzyBeatDegree,
                            crispDegreeLevel : crispDegreeLevel,
                            description : levels[crispDegreeLevel - 1],
                            difference: difference
                        }
                        games.push(game)
                    }
                }
                generateTable(games)
                plot(games)
            })
        }
    })
    function generateTable(games) {
        var headers = {
            "home" : "Home",
            "homeScore" : "",
            "visitor" : "Visitor",
            "visitorScore" : "",
            "fuzzyBeatDegree" : "Beat Degree (fuzzy)",
            "crispDegreeLevel" : "Crisp",
            "description" : "Description"
        }
        var table = new TableBuilder({'class': 'table table-sm table-striped table-responsive'})
        .setHeaders(headers) 
        .setData(games)
        .render()
        $("#table-container").html(table)
    }
    
    function plot(games) {
        var data = []
        var color = Chart.helpers.color
        for (var i = games.length - 1; i >= 0; i--) {
            data.push({y: games[i].fuzzyBeatDegree, x: games[i].difference})
        }
        fuzzyDegreeChart.data = { datasets : [ { label: "fuzzy", data: data, borderColor: 'rgb(54, 162, 235)',
        backgroundColor: color('rgb(54, 162, 235)').alpha(0.2).rgbString() }]}
        fuzzyDegreeChart.update()
        
    }
}
