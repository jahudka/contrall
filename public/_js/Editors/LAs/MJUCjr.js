(function () {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Editors = Contrall.Editors || (Contrall.Editors = {}),
        LAs = Editors.LAs || (Editors.LAs = []);

    LAs.push({
        pattern: /MJUCjr/,
        banks: false,
        bankSize: 8,

        params: {
            main: {
                left: 0,
                right: 1
            },
            other: [
                {index: 2, type: 'select', items: [
                    {label: 'Fast', value: 0, is: function(v) { return v <= 0.25; }},
                    {label: 'Slow', value: 0.5, is: function(v) { return v > 0.25 && v < 0.75; }},
                    {label: 'Auto', value: 1, is: function(v) { return v >= 0.75; }}
                ]}
            ]
        }
    });

})();