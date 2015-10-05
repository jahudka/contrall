(function () {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Editors = Contrall.Editors || (Contrall.Editors = {}),
        LAs = Editors.LAs || (Editors.LAs = []);

    LAs.push({
        pattern: /DC1A2/,
        banks: false,
        bankSize: 16,

        params: {
            main: {
                left: 0,
                right: 1
            },
            other: [
                {index: 2, type: 'toggle', valueToState: function(v) { return v === 1; }},
                {index: 3, type: 'toggle', valueToState: function(v) { return v === 1; }},
                {index: 4, type: 'toggle', valueToState: function(v) { return v === 1; }},
                {index: 5, type: 'toggle', valueToState: function(v) { return v === 1; }}
            ]
        }
    });

})();