(function ($, _) {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {}),
        Editors = Contrall.Editors || (Contrall.Editors = {}),
        Comps = Editors.Comps || (Editors.Comps = []);

    var Comp = Editors.Comp = function (app, options) {
        this._ = {
            app: app,
            options: _.defaults(options || {}, Comp.defaults),
            elms: {
                holder: $('<div></div>'),
                main: $('<div></div>'),
                mainParams: $('<div></div>'),
                panelHolder: $('<div></div>'),
                panel: $('<div></div>'),
                graphHolder: $('<div></div>'),
                graph: $('<canvas></canvas>')
            },
            canvas: null,
            size: {
                width: null,
                height: null
            },
            comp: null,
            ratio: null,
            threshold: null,
            makeup: null,
            params: []
        };

        this._.elms.holder.addClass('fxeditor-editor fxeditor-comp');
        this._.elms.main.addClass('fxeditor-comp-main');
        this._.elms.mainParams.addClass('fxeditor-comp-main-params');
        this._.elms.panelHolder.addClass('fxeditor-comp-panel-holder panel-holder');
        this._.elms.panel.addClass('fxeditor-comp-panel panel');
        this._.elms.graphHolder.addClass('fxeditor-comp-graph-holder');
        this._.elms.graph.addClass('fxeditor-comp-graph');

        this._.elms.holder.append(
            this._.elms.main,
            this._.elms.panelHolder
        );
        this._.elms.main.append(
            this._.elms.graphHolder,
            this._.elms.mainParams
        );
        this._.elms.graphHolder.append(this._.elms.graph);
        this._.elms.panelHolder.append(this._.elms.panel);
        this._.canvas = this._.elms.graph[0].getContext('2d');

        this._.ratio = this._createKnob('ratio');
        this._.threshold = this._createKnob('threshold');
        this._.makeup = this._createKnob('makeup');

    };

    Comp.defaults = {
        onChange: _.noop
    };

    _.extend(Comp.prototype, {
        attach: function (container) {
            this._.elms.holder.appendTo(container);
            this._.ratio.attach(this._.elms.mainParams);
            this._.threshold.attach(this._.elms.mainParams);
            this._.makeup.attach(this._.elms.mainParams);
            return this;

        },

        update: function (params) {
            if (!params || !this._.comp) {
                return this;

            }

            var draw = false;

            if (params[this._.comp.params.main.ratio]) {
                this._updateWidget(this._.ratio, params[this._.comp.params.main.ratio]);
                draw = true;

            }

            if (params[this._.comp.params.main.threshold]) {
                this._updateWidget(this._.threshold, params[this._.comp.params.main.threshold]);
                draw = true;

            }

            if (draw) {
                this._drawGraph();

            }

            if (params[this._.comp.params.main.makeup]) {
                this._updateWidget(this._.makeup, params[this._.comp.params.main.makeup]);

            }

            if (this._.comp.params.other) {
                _.each(this._.comp.params.other, function (param, index) {
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
            return !!_.find(Comps, function (comp) {
                return comp.pattern.test(name);
            });
        },

        supportsBanks: function () {
            return false;

        },

        getBankSize: function () {
            return this._.comp.bankSize;

        },

        setPlugin: function (name) {
            this._.comp = _.find(Comps, function (comp) {
                return comp.pattern.test(name);

            });

            this._cleanup();
            this._setup();

        },

        _cleanup: function () {
            var reset = {name: '', value: null, description: ''};
            this._updateWidget(this._.ratio, reset);
            this._updateWidget(this._.threshold, reset);
            this._updateWidget(this._.makeup, reset);

            this._.elms.panel.empty();
            this._.params = [];
            this._.setup = false;

        },

        _setup: function () {
            if (this._.setup) {
                return;

            }

            this._.setup = true;

            this._.size.width = this._.elms.graphHolder.width();
            this._.size.height = this._.elms.graphHolder.height();

            this._drawGraph();

            _.each(this._.comp.params.other, function (param, index) {
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
                case 'threshold':
                case 'ratio':
                    this._drawGraph();
                    // intentionally no break

                case 'makeup':
                    param = this._.comp.params.main[param];
                    break;

                default:
                    param = this._.comp.params.other[param].index;
                    break;
            }

            this._.options.onChange(param, address, value);

        },

        _createParam: function (param, index) {
            switch (param.type) {
                case 'knob':
                    return this._createKnob(index, param);

                case 'select':
                    return this._createSelect(index, param.items);

                case 'toggle':
                    return this._createToggle(index, param);

            }
        },

        _createKnob: function (knob, options) {
            return new Controls.Knob(_.extend({
                zeroSnap: false,
                onChange: this._getChangeHandler(knob, '/value'),
                onTouch: this._getChangeHandler(knob, '/touch')
            }, _.pick(options || {}, ['zeroPos', 'zeroSnap'])));
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
        },

        _drawGraph: function () {
            var threshold = this._.threshold.getValue() || 0,
                ratio = 1 / this._.comp.getRatio(this._.ratio.getValue() || 0, this._.ratio.getDescription() || ''),
                w = this._.size.width,
                h = this._.size.height,
                x, y;

            if (this._.comp.inverseThreshold) {
                threshold = 1 - threshold;

            }

            this._.elms.graph.prop({
                width: w,
                height: h
            });

            // background
            this._.canvas.fillStyle = '#000000';
            this._.canvas.fillRect(0, 0, w, h);
            this._.canvas.fill();

            // bg under curve
            this._.canvas.strokeStyle = '#221100';
            this._.canvas.fillStyle = '#221100';
            this._.canvas.lineWidth = 3;
            this._.canvas.beginPath();

            x = Math.round(threshold * w);
            y = Math.round(threshold * h);
            this._.canvas.moveTo(0, h);
            this._.canvas.lineTo(x, h - y);
            y = threshold * h + ratio * (1 - threshold) * h;
            this._.canvas.lineTo(w, h - y);
            this._.canvas.lineTo(w, h);
            this._.canvas.stroke();
            this._.canvas.fill();

            // curve
            this._.canvas.strokeStyle = '#ffaa00';
            this._.canvas.lineWidth = 3;
            this._.canvas.lineCap = 'round';

            this._.canvas.beginPath();

            x = Math.round(threshold * w);
            y = Math.round(threshold * h);
            this._.canvas.moveTo(0, h - 0.5);
            this._.canvas.lineTo(x - 0.5, h - y - 0.5);
            y = threshold * h + ratio * (1 - threshold) * h;
            this._.canvas.lineTo(w - 0.5, h - y - 0.5);

            this._.canvas.stroke();
            this._.canvas.closePath();

        }
    });

})(jQuery, _);