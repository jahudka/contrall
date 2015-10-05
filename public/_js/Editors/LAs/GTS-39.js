(function () {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Editors = Contrall.Editors || (Contrall.Editors = {}),
        LAs = Editors.LAs || (Editors.LAs = []);

    LAs.push({
        pattern: /GTS-39/,
        banks: false,
        bankSize: 16,

        params: {
            main: {
                left: 0,
                right: 3
            },
            other: [
                {index: 1, type: 'knob'},
                {index: 2, type: 'knob'},
                {index: 5, type: 'knob'},
                {index: 6, type: 'select', items: [
                    {label: 'EQ1', value: 0, is: function(v) { return v === 0; }},
                    {label: 'EQ2', value: 1, is: function(v) { return v > 0; }}
                ]},
                {index: 7, type: 'select', items: [
                    {label: 'Original', value: 0, is: function(v) { return v < 0.7; }},
                    {label: 'Smoother', value: 1, is: function(v) { return v >= 0.7; }}
                ]},
                {index: 4, type: 'select', items: [
                    {label: 'Stereo', value: 0, is: function(v) { return v === 0; }},
                    {label: 'Dual mono', value: 1, is: function(v) { return v > 0; }}
                ]},
                {index: 8, type: 'select', items: [
                    {label: 'Draft', value: 0.1, is: function(v) { return v >= 0.07 && v < 0.17; }},
                    {label: '8x', value: 0, is: function(v) { return v < 0.07; }},
                    {label: 'On export', value: 0.2, is: function(v) { return v >= 0.17; }}
                ]}
            ]
        }
    });

})();