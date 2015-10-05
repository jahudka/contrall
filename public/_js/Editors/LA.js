(function ($, _) {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {}),
        Editors = Contrall.Editors || (Contrall.Editors = {}),
        LAs = Editors.LAs || (Editors.LAs = []);

    var LA = Editors.LA = function (app, options) {
        this._ = {
            app: app,
            options: _.defaults(options || {}, LA.defaults),
            elms: {
                holder: $('<div></div>'),
                main: $('<div></div>'),
                panelHolder: $('<div></div>'),
                panel: $('<div></div>')
            },
            setup: false,
            la: null,
            params: [],
            leftKnob: null,
            rightKnob: null
        };

        this._.elms.holder.addClass('fxeditor-editor fxeditor-la');
        this._.elms.main.addClass('fxeditor-la-main');
        this._.elms.panelHolder.addClass('fxeditor-la-panel-holder panel-holder');
        this._.elms.panel.addClass('fxeditor-la-panel panel');

        this._.elms.holder.append(
            this._.elms.main,
            this._.elms.panelHolder
        );

        this._.elms.panelHolder.append(
            this._.elms.panel
        );

        this._.leftKnob = this._createKnob('left');
        this._.rightKnob = this._createKnob('right');

    };

    LA.defaults = {
        onChange: _.noop
    };

    _.extend(LA.prototype, {
        attach: function (container) {
            this._.elms.holder.appendTo(container);
            this._.leftKnob.attach(this._.elms.main);
            this._.rightKnob.attach(this._.elms.main);
            return this;

        },

        update: function (params) {
            if (!params || !this._.la) {
                return this;

            }

            if (params[this._.la.params.main.left]) {
                this._updateWidget(this._.leftKnob, params[this._.la.params.main.left]);

            }

            if (params[this._.la.params.main.right]) {
                this._updateWidget(this._.rightKnob, params[this._.la.params.main.right]);

            }

            if (this._.la.params.other) {
                _.each(this._.la.params.other, function (param, index) {
                    if (params[param.index] && this._.params[index]) {
                        this._updateWidget(this._.params[index], params[param.index]);

                    }
                }.bind(this));
            }

            return this;

        },

        reposition: function () {
            return this;

        },

        supportsPlugin: function (name) {
            return !!_.find(LAs, function (la) {
                return la.pattern.test(name);
            });
        },

        supportsBanks: function () {
            return false;

        },

        getBankSize: function () {
            return this._.la.bankSize;

        },

        setPlugin: function (name) {
            this._.la = _.find(LAs, function (la) {
                return la.pattern.test(name);

            });

            this._cleanup();
            this._setup();

        },

        _cleanup: function () {
            var reset = {name: '', value: null, description: ''};
            this._updateWidget(this._.leftKnob, reset);
            this._updateWidget(this._.rightKnob, reset);

            this._.elms.panel.empty();
            this._.params = [];
            this._.setup = false;

        },

        _setup: function () {
            if (this._.setup) {
                return;

            }

            this._.setup = true;

            _.each(this._.la.params.other, function (param, index) {
                var widget = this._createParam(param, index);
                widget.attach(this._.elms.panel);
                this._.params.push(widget);

            }.bind(this));
        },

        _updateWidget: function (widget, params) {
            _.each(params, function (value, key) {
                switch (key) {
                    case 'name':
                        widget.setName(value);
                        break;

                    case 'value':
                        widget.setValue(value);
                        break;

                    case 'description':
                        widget.setDescription(value);
                        break;

                }
            });
        },

        _getChangeHandler: function (param, address) {
            return function(value) {
                this._handleChange(param, address, value);

            }.bind(this);
        },

        _handleChange: function (param, address, value) {
            switch (param) {
                case 'left':
                case 'right':
                    param = this._.la.params.main[param];
                    break;

                default:
                    param = this._.la.params.other[param].index;
                    break;
            }

            this._.options.onChange(param, address, value);

        },

        _createParam: function (param, index) {
            switch (param.type) {
                case 'knob':
                    return this._createKnob(index);

                case 'select':
                    return this._createSelect(index, param.items);

                case 'toggle':
                    return this._createToggle(index, param);

            }
        },

        _createKnob: function (knob) {
            return new Controls.Knob({
                zeroSnap: false,
                onChange: this._getChangeHandler(knob, '/value'),
                onTouch: this._getChangeHandler(knob, '/touch')
            });
        },

        _createSelect: function (index, items) {
            return new Controls.Select({
                className: 'panel-select',
                items: items,
                onChange: this._getChangeHandler(index, '/value'),
                onTouch: this._getChangeHandler(index, '/value')
            });
        },

        _createToggle: function (index, options) {
            return new Controls.Toggle(_.extend({
                onChange: this._getChangeHandler(index, '/value'),
                onTouch: this._getChangeHandler(index, '/touch')
            }, _.pick(options || {}, ['stateToValue', 'valueToState'])));
        }
    });

})(jQuery, _);