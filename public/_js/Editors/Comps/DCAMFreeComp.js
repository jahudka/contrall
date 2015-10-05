(function () {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Editors = Contrall.Editors || (Contrall.Editors = {}),
        Comps = Editors.Comps || (Editors.Comps = []);

    Comps.push({
        pattern: /DCAMFreeComp/,
        banks: false,
        bankSize: 16,

        params: {
            main: {
                ratio: 1,
                threshold: 2,
                makeup: 3
            },
            other: [
                {index: 0, type: 'knob'},
                {index: 4, type: 'knob'},
                {index: 5, type: 'knob'}
            ]
        },

        getRatio: function (value, description) {
            return parseFloat(description || '1');

        }
    });

})();