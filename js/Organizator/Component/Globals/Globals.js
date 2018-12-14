define(function () {
    class Organizator_Globals {
        constructor() {
            this.globals = {};
        }

        set(key, value){
            this.globals[key] = value;

            return this.globals[key];
        }

        get(key){
            return typeof this.globals[key] !== 'undefined' ? this.globals[key] : typeof window.globals[key] !== 'undefined' ? window.globals[key] : undefined;
        }
    }

    return Organizator_Globals;
});