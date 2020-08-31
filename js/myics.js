// my ics
(function(){
    //https://github.com/nwcell/ics.js/
    var docTitle = document.querySelector('input.docs-title-input').value;
    var dateRe = /(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}/;
    var date = new Date(docTitle.match(dateRe)[0]+' ' + new Date().getFullYear());
    

    
    var printpreview = document.querySelector('iframe#docs-printpreview-frame');
    var text = printpreview.contentDocument.body.innerText;
    var meetings = text.match(/^\d[\d:]+[\s\S]*?(?=(\n\d[\d:])|(Page \d of \d))/gm);
    for (m=0; m < meetings.length; m++) {

        meetings[m] = {
            time: meetings[m].match(/[\d:\- ap\.m]*?(?=(: )|\/|( A-Z))/)[0],
            desc: meetings[m]
        };        
    
    }
    console.log(meetings);

})();
