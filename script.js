$(document).ready(function() {

    function convertDate(dateArray) {
        y = dateArray[0]; m = dateArray[1]-1; d = dateArray[2];

        if (y === 999) {
            return new Date();
        };
        return new Date(y, m, d)
    }

    var data = []
    var stranke = {}

    d3.json("stranke.json", function(json){
        var obj = json.stranke_condensed;
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                data.push(obj[prop])
        }
    
        var width = 1200;
        var height = 450;
        var padding = 40;


        var m = [80, 80, 80, 80],
        w = 960 - m[1] - m[3],
        h = 500 - m[0] - m[2],
        parse = d3.time.format("%b %Y").parse;

        var x = d3.time.scale().domain([new Date(1989, 0, 1), new Date(2011, 11, 31)]).range([0, width]);
        var y = d3.scale.linear().domain([0, 22]).range([0, height])
        
        var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true)
        var date_format = d3.time.format("%Y");

        var timeline = d3.select("#timeline")
            .append('svg:svg')
            .attr('class', 'timeline')
            .attr('width', width+padding)
            .attr('height', height+padding)

        var axisGroup = timeline.append("svg:g")
            .attr("transform", "translate("+padding+","+padding+")")

        axisGroup.selectAll("line")
            .data(x.ticks(10))
            .enter().append("svg:line")
                .attr("x1", x)
                .attr("x2", x)
                .attr("y1", 0)
                .attr("y2", 10)
                .attr("stroke", "#bbb")
                .attr("stroke-width", 1)
        
        axisGroup.selectAll("text.rule")
            .data(x.ticks(10))
            .enter().append("svg:text")
                .attr("class", "rule")
                .attr("x", function(d){ return x(d)+26; })
                .attr("y", 0)
                .attr("dy", -3)
                .attr("text-anchor", "middle")
                .text(date_format)
                
        
        // draw political parties
        var line_counter = 0;
        data.map(function(stranka, i){
            line_counter += 1;
            

            var sg = timeline.append("svg:g")
                .attr("transform", "translate("+padding+","+padding+")")
                //.attr("id", "group_"+line_counter)
            
            sg.selectAll("line")
                .data(stranka)
                .enter().append("svg:line")
                    .attr("x1", function(d) { return x(convertDate(d.od)) })
                    .attr("x2", function(d) { return x(convertDate(d.do)) })
                    .attr("y1", function()  { d.line = line_counter; return y(line_counter); })
                    .attr("y2", function()  { return y(line_counter); })
                    .attr("stroke", "#ccc")
                    .attr("stroke-width", '6')
                    .attr("id", function(d) { return "stranka_"+d.id; })
                    .on('mouseover', function(d,i){
                        $('#title').html(d.ime + ' ('+d.okrajsava+')');
                        $(this).attr("stroke", 'red');
                    })
                    .on('mouseout', function(d,i){
                        console.log('leave');
                        $(this).attr("stroke", '#ccc');
                    })

        })

        // draw connections
        data.map(function(stranka, index){
            /* copy all parties into new array and remove the ones that have
               empty 'nastala_iz' since there is nothing to connect them to
               (I don't know yet how to do this directly from d3.data() loop) */
            var povezave = stranka.slice();
            for (var i = povezave.length - 1; i >= 0; i--) {
                if (povezave[i].nastala_iz.length === 0) {
                    povezave.splice(i,1);
                };
            };
            
            //var sg = d3.select('#stranka_'+(index+1));

            var sg = timeline.append("svg:g")
                .attr("transform", "translate("+padding+","+padding+")")

            povezave.map(function(pov){
                sg.selectAll("line")
                .data(pov.nastala_iz)
                .enter().append("svg:line")
                    .attr("x1", function(d, i) { 
                        return $('#stranka_'+d).attr('x2');
                    })
                    .attr("y1", function(d, i) {
                        return $('#stranka_'+d).attr('y2');  
                    })
                    .attr("x2", function(d, i) { 
                        pov_x1 = parseFloat($('#stranka_'+pov.id).attr('x1'));
                        d_x1   = parseFloat($('#stranka_'+d).attr('x2'));

                        return Math.max(pov_x1, d_x1);
                    })
                    .attr("y2", function(d, i) { 
                        return $('#stranka_'+pov.id).attr('y1');
                    })
                    .attr("stroke", "#ccc")
                    .attr("id", function(d) { return "stranka_"+d.id; })

            });

        
        })

        
    })
});