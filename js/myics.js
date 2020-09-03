(function(){
    
    var version = 'myics.js version 2020-09-03 11:56';
    console.warn(version);

    var pp = document.querySelector('div#docs-printpreview');
    if( !pp || !pp.offsetParent ) {
        alert('Click "File" then "Print settings and preview", then try again');
        return;
    }

    //https://github.com/nwcell/ics.js/
    var script = document.createElement('script');
    script.onload = function() {
      exportIcs();
    };
    script.src = '//jon-freed.github.io/js/ics.deps.min.js';
    document.getElementsByTagName('head')[0].appendChild(script);


    function exportIcs() {

        var docTitle = document.querySelector('input.docs-title-input').value;
        console.log(`docTitle=[${docTitle}]`);

        var dateRe = /(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}/;
        var date = new Date(docTitle.match(dateRe)[0]+' ' + new Date().getFullYear());
        console.log(`date=[${date}]`);

        var printpreview = document.querySelector('iframe#docs-printpreview-frame');
        var text = printpreview.contentDocument.body.innerText;
        console.log(`text=[${text}]`);
        
        var meetings = text.match(/^\d[\d:]+[\s\S]*?(?=(\n\d[\d:])|(Page \d of \d))/gm);
        console.log(`meetings=`,meetings);

        var uidDomain = (new Date()).toISOString().replaceAll(/[-:\.]/g,'');
        console.log(`uidDomain=[${uidDomain}]`);

        var cal = new ics(uidDomain);
        var parsedMeetingsTokens = [];
        for (var m=0; m < meetings.length; m++) {
            console.log(`meeting ${m} =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=`)

            var subj = meetings[m].split('\n')[0].trim();
            console.log(`subj=[${subj}]`);

            var desc = meetings[m].replaceAll('\n\n','\n').trim();
            desc = desc.split('\n').slice(1).join('\n');
            console.log(`desc=[${desc}]`);

            var loc = subj.match(/https.+/);
            loc = loc ? loc[0] : '';
            console.log(`loc=[${loc}]`);

            if( loc != '' ) {
                subj = subj.replace(loc,'').trim();
                console.log(`subj=[${subj}]`);
            }

            var time = meetings[m].match(/[\d:\- ap\.m]*?(?=(: )|\/|( A-Z))/)[0];
            console.log(`time=[${time}]`);
            time = time.split('-');

            function getFullDate(time) {
                var hour = time.split(':')[0];
                console.log(`hour=[${hour}]`);

                var hourInt = parseInt(hour);
                console.log(`hourInt=[${hourInt}]`);

                var hour24 = hourInt;
                if( hourInt <= 8 ) {
                    hour24 = hourInt + 12;    
                } 
                console.log(`hour24=[${hour24}]`);

                var min = time.split(':')[1].replaceAll(/[ a\.pm\/]/g,'');
                console.log(`min=[${min}]`);

                var fullDate = new Date(date);
                fullDate.setHours( hour24 );
                fullDate.setMinutes( min );
                return fullDate;
            }

            var start = getFullDate(time[0]);
            console.log(`start=[${start}]`);

            var end = getFullDate(time[1]);
            console.log(`end=[${end}]`);

            cal.addEvent(subj, desc, loc, start, end);

            var parsedMeetingTokens = {
                "subj":subj,
                "desc":desc,
                "loc":loc,
                "start":start,
                "end":end
            };
            console.log('parsedMeetingTokens=',parsedMeetingTokens);

            parsedMeetingsTokens.push(parsedMeetingTokens);
        }
        console.log('parsedMeetingsTokens=',parsedMeetingsTokens);

        var filename = uidDomain;
        console.log(`filename=[${filename}]`);

        cal.download(filename);

        console.warn(version);    
    }    

})();
