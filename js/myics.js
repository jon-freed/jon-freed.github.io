(function(){
    
    var version = 'myics.js version 2020-09-22 12:29';

    var logText = '';
    function log(x) {
        logText += x + '\n';
        console.log(x);

        var idPrefix = 'myics';
        var modalId = 'myicsoutputmodal';
        var modal = document.querySelector('#'+idPrefix+'overlaycontainer');
        if( !modal ) {
            modal = document.createElement("div");
            modal.id = idPrefix+'overlaycontainer';
            modal.innerHTML = `
<style>
#${idPrefix}overlay {
    position: fixed;
    display: none;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.75);
    z-index: 200000;
    overflow: auto;
}
#${idPrefix}overlaycontent{
    position: absolute;
    margin: 20px;
    color: white;
    font-family: monospace;
}
</style>
<div id="${idPrefix}overlay">
  <pre id="${idPrefix}overlaycontent"></pre>
</div>
`;
            document.body.prepend(modal);
            var overlay = document.querySelector(`#${idPrefix}overlay`)
            overlay.addEventListener('click',function(){
                this.style.display = 'none';                
            });
        }
        document.querySelector(`#${idPrefix}overlaycontent`).innerText = logText;
        var overlay = document.querySelector(`#${idPrefix}overlay`);
        if( overlay && overlay.style.display != 'block' ) overlay.style.display = 'block';
    }


    var pp = document.querySelector('div#docs-printpreview');
    if( !pp || !pp.offsetParent ) {
        alert('Click "File" then "Print settings and preview", then try again');
        return;
    }

    log(version);


    //https://github.com/nwcell/ics.js/
    var script = document.createElement('script');
    script.onload = function() {
      exportIcs();
    };
    script.src = '//jon-freed.github.io/js/ics.deps.min.js';
    document.getElementsByTagName('head')[0].appendChild(script);


    function exportIcs() {

        try {

            var docTitle = document.querySelector('input.docs-title-input').value;
            log(`docTitle=[${docTitle}]`);

            var dateRe = /(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}/;
            var date = new Date(docTitle.match(dateRe)[0]+' ' + new Date().getFullYear());
            log(`date=[${date}]`);

            var printpreview = document.querySelector('iframe#docs-printpreview-frame');
            var text = printpreview.contentDocument.body.innerText;
            log(`print preview frame text=[${text}]`);

            // Each meeting starts with a time, and it continues until the processor 
            // sees another time, sees a Page number, or sees 'Displaying '.
            var meetings = text.match(/^\d[\d:]+[\s\S]*?(?=(\n\d[\d:])|(Page \d of \d)|(\nDisplaying ))/gm);
            log('meetings.length='+meetings.length);

            var uidDomain = (new Date()).toISOString().replaceAll(/[-:\.]/g,'');
            log(`uidDomain=[${uidDomain}]`);

            var cal = new ics(uidDomain);
            var parsedMeetingsTokens = [];
            for (var m=0; m < meetings.length; m++) {
                log(`meeting ${m} =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=`)

                var subj = meetings[m].split('\n')[0].trim();
                try {
                    subj = subj.match(/(?<=\.m\.[\/:]).*/g)[0].trim();
                }
                catch(e) {
                    log(`error when trying to find the end of the meeting's time and get the remaining text as subject`);
                }
                log(`subj=[${subj}]`);

                var desc = meetings[m].replaceAll('\t',' ').replaceAll('\n\n','\n').trim();
                desc = desc.split('\n').slice(1).join('\n').replaceAll(';',', and');
                log(`desc=[${desc}]`);

                var loc = subj.match(/https.+/);
                loc = loc ? loc[0] : '';
                log(`loc=[${loc}]`);

                if( loc != '' ) {
                    subj = subj.replace(loc,'').trim();
                    log(`subj=[${subj}]`);
                }

                var time = meetings[m].match(/[\d:\- ap\.m]*?(?=(: )|\/|( A-Z))/)[0];
                log(`time=[${time}]`);
                time = time.split('-');

                function getFullDate(time) {
                    var hour = time.split(':')[0];
                    log(`hour=[${hour}]`);

                    var hourInt = parseInt(hour);
                    log(`hourInt=[${hourInt}]`);

                    var hour24 = hourInt;
                    if( hourInt <= 8 ) {
                        hour24 = hourInt + 12;    
                    } 
                    log(`hour24=[${hour24}]`);

                    var min = time.split(':')[1].replaceAll(/[ a\.pm\/]/g,'');
                    log(`min=[${min}]`);

                    var fullDate = new Date(date);
                    fullDate.setHours( hour24 );
                    fullDate.setMinutes( min );
                    return fullDate;
                }

                var start = getFullDate(time[0]);
                log(`start=[${start}]`);

                var end;
                if( time.length > 1 ) {
                    end = getFullDate(time[1]);
                }
                else {
                    log(`WARNING: there does not appear to be an end time for this meeting`);
                    end = start;
                }
                log(`end=[${end}]`);

                cal.addEvent('[AI] ' + subj, desc, loc, start, end);

                var parsedMeetingTokens = {
                    "subj":subj,
                    "desc":desc,
                    "loc":loc,
                    "start":start,
                    "end":end
                };
                log('parsedMeetingTokens=',parsedMeetingTokens);

                parsedMeetingsTokens.push(parsedMeetingTokens);
            }
            log('parsedMeetingsTokens=',parsedMeetingsTokens);

            var filename = uidDomain;
            log(`filename=[${filename}]`);

            cal.download(filename);

            log('meetings.length='+meetings.length);
        }
        catch(e) {
            log(`ERROR ` + e.toString() );
        }
        log(version);
    }    

})();
