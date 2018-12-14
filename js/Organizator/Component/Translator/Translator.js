define(function (){
    class Organizator_Translator {
        constructor(options) {
            options = Object.assign({}, options);
            
            this.availableLocales = options.availableLocales;
            this.defaultLocale = this.availableLocales.indexOf(options.defaultLocale) > -1 ? options.defaultLocale : undefined;
            this.locale = this.availableLocales.indexOf(options.locale) > -1 ? options.locale : options.defaultLocale;
            
            this.strings = {};
            for(let locale of this.availableLocales){
                this.strings[locale] = {};
            }
        }
        
        setLocale(locale){
            this.locale = locale;
        }
        
        translate(id, parameters){
            let string = this.strings[this.locale][id] || this.strings[this.defaultLocale][id] || id;
            
            return string;
        }
        
        addString(locale, id, string){
            this.strings[locale][id] = string;
        }
        
        addStrings(locale, strings){
            Object.assign(this.strings[locale], strings);
        }
        
        getString(id, locale = this.locale){
            return this.strings[locale][id] || this.strings[this.defaultLocale][id] || id;
        }
        
        addDocument(document, type, locale){
            switch(type){
                case 'xliff':
                case 'xlf':
                    this.addXliffDocument(document);
                    break;
            }
        }
        
        addXliffDocument(document){
            let files = document.querySelectorAll('file');
            
            for(let file of files){
                let sourceLanguage = file.getAttribute('source-language'),
                    targetLanguage = file.getAttribute('target-language'),
                    body = file.querySelector('body'),
                    transUnits = body.querySelectorAll('trans-unit');
            
                for(let transUnit of transUnits){
                    let sourceString = transUnit.querySelector('source').innerHTML;
                    let target = transUnit.querySelector('target');
                    let targetString = target ? target.innerHTML : sourceString;
                    
                    this.addString(targetLanguage || sourceLanguage, sourceString, targetString);
                }
            }
        }
    }
    
    return Organizator_Translator;
});