define(
    [
        'js/Organizator/Organizator',
        'text'
    ], function(
        Organizator,
        text
    ){
    let buildMap = {};

    return {
        load: function(name, parentRequire, onload, config) {
            text.get(parentRequire.toUrl(name), function(data){
                    let parser = new DOMParser();
                    let xliffDocumet = parser.parseFromString(data, 'application/xml');
                    
                    let files = xliffDocumet.querySelectorAll('file');
                
                    for(let file of files){
                        let sourceLanguage = file.getAttribute('source-language'),
                            targetLanguage = file.getAttribute('target-language'),
                            body = file.querySelector('body'),
                            transUnits = body.querySelectorAll('trans-unit');

                        for(let transUnit of transUnits){
                            let sourceString = transUnit.querySelector('source').innerHTML;
                            let target = transUnit.querySelector('target');
                            let targetString = target ? target.innerHTML : sourceString;

                            Organizator.Translator.addString(targetLanguage || sourceLanguage, sourceString, targetString);
                        }
                    }

                    onload(data);
                }
            );
        }
    };
});