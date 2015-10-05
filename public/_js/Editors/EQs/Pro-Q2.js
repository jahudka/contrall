(function () {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Editors = Contrall.Editors || (Contrall.Editors = {}),
        EQs = Editors.EQs || (Editors.EQs = []);

    EQs.push({
        pattern: /FF Pro-Q 2/,
        banks: false,
        bankSize: 192,
        maxBands: 24,

        features: {
            notch: true,
            bands: {
                gain: true,
                frequency: true,
                q: true,
                active: true,
                type: true
            },
            params: [
                {index: 172, type: 'knob'},
                {index: 176, type: 'toggle', valueToState: function(v) { return v === 1; }},
                {index: 175, type: 'toggle', valueToState: function(v) { return v === 1; }}
            ]
        },

        notch: {
            setup: {
                type: 0,
                gain: 0.6000000238418579,
                q: 0.8120982050895691
            },
            active: {
                type: 0.7142857313156128,
                gain: 0.5,
                q: 0.9060490727424622
            }
        },

        bandTypes: [
            {value: 0, label: 'Bell', is: function(v) { return v < 1/7; }},
            {value: 1/7, label: 'Low Shelf', is: function(v) { return v >= 1/7 && v < 2/7; }},
            {value: 2/7, label: 'Low Cut', is: function(v) { return v >= 2/7 && v < 3/7; }},
            {value: 3/7, label: 'High Shelf', is: function(v) { return v >= 3/7 && v < 4/7; }},
            {value: 4/7, label: 'High Cut', is: function(v) { return v >= 4/7 && v < 5/7; }},
            {value: 5/7, label: 'Notch', is: function(v) { return v >= 5/7 && v < 6/7; }},
            {value: 6/7, label: 'Band Pass', is: function(v) { return v >= 6/7 && v < 1; }},
            {value: 1, label: 'Tilt Shelf', is: function(v) { return v === 1; }}
        ],

        rulers: {
            gain: {
                values: [0.8333333134651184, 0.6666666865348816, 0.3333333432674408, 0.1666666716337204],
                labels: ['20', '10', '-10', '-20']
            },
            frequency: {
                values: [0.0865744948387146, 0.13721735775470734, 0.1731489896774292, 0.201019749045372, 0.22379185259342194, 0.24304533004760742, 0.2597234845161438, 0.2744346857070923, 0.2875942289829254, 0.37416872382164, 0.42481160163879395, 0.4607432186603546, 0.4886139929294586, 0.5113860964775085, 0.5306395888328552, 0.5473177433013916, 0.5620289444923401, 0.5751944184303284, 0.6617629528045654, 0.7124058604240417, 0.74833744764328, 0.776208221912384, 0.7989802360534668, 0.818233847618103, 0.8349119424819946, 0.8496231436729431, 0.8627827167510986, 0.9493572115898132],
                labels: ['20', null, null, '50', null, null, null, null, '100', '200', null, null, '500', null, null, null, null, '1k', '2k', null, null, '5k', null, null, null, null, '10k', '20k']
            }
        },

        onActivate: function (band, params) {
            if (params.active !== null) {
                return null;

            }

            return [
                {param: band * 7 + 3, value: 0.5}, // default Q of 1
                {param: band * 7 + 4, value: 0}, // default shape 'Bell'
                {param: band * 7 + 5, value: 0.125}, // default slope of 12dB/oct
                {param: band * 7 + 6, value: 1} // default stereo mode
            ];
        },

        isActive: function (value) {
            return value < 1 ? (value >= 0.5) : null;

        },

        convertActive: function (value) {
            return value ? 0.5 : 0;

        },

        mapBand: function (band, param) {
            var offset;

            switch (param) {
                case 'active': offset = 0; break;
                case 'frequency': offset = 1; break;
                case 'gain': offset = 2; break;
                case 'q': offset = 3; break;
                case 'type': offset = 4; break;

                default:
                    return null;
            }

            return band * 7 + offset;

        },

        getBand: function (param, index) {
            if (index < 168 && param.name.match(/^Band \d+/)) {
                return Math.floor(index / 7);

            }

            return null;

        }
    });

})();