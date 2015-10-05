(function () {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Editors = Contrall.Editors || (Contrall.Editors = {}),
        EQs = Editors.EQs || (Editors.EQs = []);

    EQs.push({
        pattern: /ReaEQ/,
        banks: false,
        bankSize: 48,
        maxBands: 16,

        features: {
            bands: {
                gain: true,
                frequency: true,
                q: true,
                active: false,
                type: false
            },
            params: false
        },

        rulers: {
            gain: {
                values: [0.6658770442008972, 0.2505936026573181],
                labels: ['+6', '-6']
            },
            frequency: {
                values: [0.06769197434186935, 0.1414380669593811, 0.23138615489006042, 0.2895059883594513, 0.3325263559818268, 0.36669665575027466, 0.39504411816596985, 0.4192672371864319, 0.4404151737689972, 0.45918142795562744, 0.47604861855506897, 0.5884538292884827, 0.6550067663192749, 0.702453076839447, 0.7393508553504944, 0.7695478796958923, 0.7951077818870544, 0.8172670602798462, 0.8368251919746399, 0.8543292284011841, 0.8701699376106262, 0.8846361041069031, 0.8979474306106567, 0.9102746844291687, 0.9217534065246582, 0.969637930393219, 0.9885094165802002],
                labels: ['50', '100', '200', '300', null, '500', null, null, null, null, '1.0k', '2.0k', '3.0k', null, '5.0k', null, null, null, null, '10.0k', null, null, null, null, null, '20.0k', null]
            }
        },

        isActive: function (value) {
            throw new Error('ReaEQ doesn\'t support band active/inactive states via OSC');

        },

        convertActive: function (active) {
            throw new Error('ReaEQ doesn\'t support band active/inactive states via OSC');

        },

        onActivate: function (band, params) {
            return null;

        },

        mapBand: function (band, param) {
            var offset;

            switch (param) {
                case 'frequency': offset = 0; break;
                case 'gain': offset = 1; break;
                case 'q': offset = 2; break;

                default:
                    return null;
            }

            return band * 3 + offset;

        },

        getBand: function (param, index) {
            if (index < 48 && param.name.match(/^(Q|Freq|Gain)-/)) {
                return Math.floor(index / 3);

            }

            return null;

        }
    });

})();