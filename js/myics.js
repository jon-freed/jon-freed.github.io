(function(){
    //https://github.com/nwcell/ics.js/
    var script = document.createElement('script');
    script.onload = function() {
      exportIcs();
    };
    script.src = '//jon-freed.github.io/js/ics.deps.min.js';
    document.getElementsByTagName('head')[0].appendChild(script);

    function exportIcs() {
        var docTitle = document.querySelector('input.docs-title-input').value;
        var dateRe = /(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}/;
        var date = new Date(docTitle.match(dateRe)[0]+' ' + new Date().getFullYear());

        var printpreview = document.querySelector('iframe#docs-printpreview-frame');
        var text = printpreview.contentDocument.body.innerText;
        var meetings = text.match(/^\d[\d:]+[\s\S]*?(?=(\n\d[\d:])|(Page \d of \d))/gm);
        var cal = new ics();
        for (var m=0; m < meetings.length; m++) {

            var time = meetings[m].match(/[\d:\- ap\.m]*?(?=(: )|\/|( A-Z))/)[0];
            var subj = meetings[m].split('\n')[0];
            var desc = meetings[m].replaceAll('\n\n','\n');;
            var loc = subj.match(/https.+/);
            var start = new Date();
            var end = new Date();

            cal.addEvent(subj, desc, loc, start, end);

            console.log({subj:subj,desc:desc,loc:loc,start:start,end:end});
        }
        var filename = (new Date().toISOString()).replaceAll(':','.');
        cal.download(filename);
    }    

})();
