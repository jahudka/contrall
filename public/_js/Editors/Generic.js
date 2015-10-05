(function($, _) {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {}),
        Editors = Contrall.Editors || (Contrall.Editors = {});

    var Generic = Editors.Generic = function (app, options) {
        this._ = {
            app: app,
            options: _.defaults(options || {}, Generic.defaults),
            elms: {
                holder: $('<div></div>')
            },
            knobs: []
        };

        this._.elms.holder.addClass('fxeditor-editor fxeditor-generic');

        this._createKnobs();

    };

    Generic.defaults = {
        params: 24,
        onChange: _.noop
    };

    _.extend(Generic.prototype, {
        attach: function (container) {
            this._.elms.holder.appendTo(container);

            _.each(this._.knobs, function (knob) {
                knob.attach(this._.elms.holder);

            }.bind(this));

            return this;

        },

        update: function (params) {
            _.each(params, function (data, index) {
                if (data && index < this._.options.params) {
                    this._updateKnob(index, data);

                }
            }, this);

            return this;

        },

        reposition: function () {
            // noop
        },

        supportsPlugin: function (name) {
            return true;
        },

        supportsBanks: function () {
            return true;
        },

        getBankSize: function () {
            return this._.options.params;
        },

        setPlugin: function (name) {
            this._cleanup();

        },

        _cleanup: function () {
            var reset = { name: '', value: null, description: '' },
                i = 0;

            for (; i < this._.options.params; i++) {
                this._updateKnob(i, reset);

            }
        },

        _createKnobs: function () {
            this._.knobs = _.map(new Array(this._.options.params), function (v, i) {
                return new Controls.Knob({
                    onChange: this._getKnobHandler(i, '/value'),
                    onTouch: this._getKnobHandler(i, '/touch')
                });
            }.bind(this));
        },

        _getKnobHandler: function (param, address) {
            return function (value) {
                this._.options.onChange(param, address, value);

            }.bind(this);
        },

        _updateKnob: function (index, params) {
            var knob = this._.knobs[index];

            _.each(params, function (value, key) {
                switch (key) {
                    case 'name':
                        knob.setName(value);
                        break;

                    case 'value':
                        knob.setValue(value);
                        break;

                    case 'description':
                        knob.setDescription(value);
                        break;

                }
            });
        }
    });

})(jQuery, _);