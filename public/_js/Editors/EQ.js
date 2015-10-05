(function($, $d, _, undefined) {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {}),
        Editors = Contrall.Editors || (Contrall.Editors = {}),
        EQs = Editors.EQs || (Editors.EQs = []);

    var EQ = Editors.EQ = function (app, options) {
        this._ = {
            app: app,
            options: _.defaults(options || {}, EQ.defaults),
            eq: null,
            elms: {
                holder: $('<div></div>'),
                main: $('<div></div>'),
                mainPanelHolder: $('<div></div>'),
                mainPanel: $('<div></div>'),
                graphHolder: $('<div></div>'),
                graph: $('<div></div>'),
                graphRulers: $('<canvas></canvas>'),
                bandsHolder: $('<div></div>'),
                bands: $('<div></div>'),
                bandPanelHolder: $('<div></div>'),
                bandPanel: $('<div></div>'),
                btnNotch: $('<button></button>')
            },
            size: {
                width: null,
                height: null
            },
            canvas: null,
            setup: false,
            bands: null,
            params: [],
            selectedBand: null,
            bandControls: {
                frequency: null,
                gain: null,
                q: null,
                type: null
            }
        };

        this._.elms.holder.addClass('fxeditor-editor fxeditor-eq');
        this._.elms.main.addClass('fxeditor-eq-main');
        this._.elms.mainPanelHolder.addClass('fxeditor-eq-mainPanel-holder panel-holder panel-vertical');
        this._.elms.mainPanel.addClass('fxeditor-eq-mainPanel panel');
        this._.elms.graphHolder.addClass('fxeditor-eq-graph-holder');
        this._.elms.graph.addClass('fxeditor-eq-graph');
        this._.elms.graphRulers.addClass('fxeditor-eq-graph-rulers');
        this._.elms.bandsHolder.addClass('fxeditor-eq-bands-holder panel-holder');
        this._.elms.bands.addClass('fxeditor-eq-bands panel');
        this._.elms.bandPanelHolder.addClass('fxeditor-eq-bandPanel-holder panel-holder panel-vertical');
        this._.elms.bandPanel.addClass('fxeditor-eq-bandPanel panel');
        this._.elms.btnNotch.addClass('fxeditor-eq-btnNotch');

        this._.elms.holder.append(
            this._.elms.main,
            this._.elms.mainPanelHolder,
            this._.elms.bandPanelHolder
        );

        this._.elms.main.append(
            this._.elms.graphHolder,
            this._.elms.bandsHolder
        );

        this._.elms.mainPanelHolder.append(this._.elms.mainPanel);
        this._.elms.graphHolder.append(this._.elms.graph, this._.elms.graphRulers);
        this._.elms.bandsHolder.append(this._.elms.bands);
        this._.elms.bandPanelHolder.append(this._.elms.bandPanel);
        this._.elms.bandPanelHolder.css('display', 'none');

        this._.elms.graph.on('touchstart', '.fxeditor-eq-graph-point', this._handlePointDrag.bind(this));
        this._.elms.bands.on('touchstart touchend', '.fxeditor-eq-band .fxeditor-eq-band-btnActive', this._handleToggle.bind(this));
        this._.elms.bands.on('touchstart', '.fxeditor-eq-band', this._handlePanelDrag.bind(this));
        this._.elms.btnNotch.on('touchstart', this._handleNotch.bind(this));

        this._.bandControls.frequency = this._createKnob('frequency');
        this._.bandControls.gain = this._createKnob('gain');
        this._.bandControls.q = this._createKnob('q');
        this._.bandControls.frequency.setName('Frequency');
        this._.bandControls.gain.setName('Gain');
        this._.bandControls.q.setName('Q');

    };

    EQ.defaults = {
        onChange: _.noop
    };

    _.extend(EQ.prototype, {
        attach: function (container) {
            this._.elms.holder.appendTo(container);
            this._.bandControls.frequency.attach(this._.elms.bandPanel);
            this._.bandControls.gain.attach(this._.elms.bandPanel);
            this._.bandControls.q.attach(this._.elms.bandPanel);
            return this;

        },

        update: function () {
            var params = this._.app.getData().fxParams;

            if (!params) {
                return;

            }

            _.each(params, function (param, i) {
                if (!param || !param.name) {
                    return;

                }

                var index = this._.eq.getBand(param, i);

                if (index !== null) {
                    this._getBand(index);

                }
            }.bind(this));

            _.each(this._.bands, function (band) {
                if (band) {
                    this._updateBand(band, params);

                }
            }.bind(this));

            if (this._.eq.features.params) {
                _.each(this._.eq.features.params, function (param, index) {
                    if (params[param.index] && this._.params[index]) {
                        this._updateWidget(this._.params[index], params[param.index]);

                    }
                }.bind(this));
            }

            return this;

        },

        reposition: function () {
            if (!this._.setup) {
                return;

            }

            this._.size.width = this._.elms.graph.width();
            this._.size.height = this._.elms.graph.height();

            _.map(this._.bands, function (band) {
                if (band) {
                    this._updatePoint(band, band.params.frequency, band.params.gain);

                }
            }.bind(this));

            this._drawRulers();

        },

        supportsPlugin: function (name) {
            return !!_.find(EQs, function (eq) {
                return eq.pattern.test(name);
            });
        },

        supportsBanks: function () {
            return this._.eq && this._.eq.banks;

        },

        getBankSize: function () {
            return this._.eq.bankSize;

        },

        setPlugin: function (name) {
            this._.eq = _.find(EQs, function (eq) {
                return eq.pattern.test(name);

            });

            this._cleanup();
            this._setup();

        },

        _cleanup: function () {
            this._.setup = false;
            this._.bands = [];
            this._.params = [];
            this._.selectedBand = null;
            this._.elms.btnNotch.detach();
            this._.elms.graph.empty();
            this._.elms.bands.empty();
            this._.elms.mainPanel.empty();
            this._.elms.mainPanelHolder.css('display', '');
            this._.elms.bandPanelHolder.css('display', 'none');

        },

        _setup: function () {
            if (this._.setup) {
                return;

            }

            if (this._.eq.features.notch) {
                this._.elms.graph.append(this._.elms.btnNotch);

            }

            this._.size.width = this._.elms.graph.width();
            this._.size.height = this._.elms.graph.height();
            this._drawRulers();

            if (this._.eq.features.params && this._.eq.features.params.length) {
                this._addParams();

            }

            if (this._.eq.features.bands.type) {
                if (!this._.bandControls.type) {
                    this._.bandControls.type = this._createSelect('type', this._.eq.bandTypes);
                    this._.bandControls.type.attach(this._.elms.bandPanel);
                    this._.bandControls.type.setName('Type');

                } else {
                    this._.bandControls.type.setItems(this._.eq.bandTypes);

                }
            } else if (this._.bandControls.type) {
                this._.bandControls.type.remove();
                this._.bandControls.type = null;

            }

            this._.setup = true;

        },

        _updateBand: function (band, params) {
            var freq = null,
                gain = null,
                active,
                selected = this._.selectedBand === band;

            if (band.index.frequency !== null && params[band.index.frequency] !== undefined) {
                if (params[band.index.frequency].description !== undefined) {
                    band.elms.frequency.text(params[band.index.frequency].description);

                    if (selected) {
                        this._.bandControls.frequency.setDescription(params[band.index.frequency].description);

                    }
                }

                if (params[band.index.frequency].value !== undefined && params[band.index.frequency].value !== band.params.frequency) {
                    freq = params[band.index.frequency].value;

                    if (selected) {
                        this._.bandControls.frequency.setValue(freq);

                    }
                }
            }

            if (band.index.gain !== null && params[band.index.gain] !== undefined) {
                if (params[band.index.gain].description !== undefined) {
                    band.elms.gain.text(params[band.index.gain].description);

                    if (selected) {
                        this._.bandControls.gain.setDescription(params[band.index.gain].description);

                    }
                }

                if (params[band.index.gain].value !== undefined && params[band.index.gain].value !== band.params.gain) {
                    gain = params[band.index.gain].value;

                    if (selected) {
                        this._.bandControls.gain.setValue(gain);

                    }
                }
            }

            if (band.index.q !== null && params[band.index.q] !== undefined) {
                if (params[band.index.q].description !== undefined) {
                    band.elms.q.text(params[band.index.q].description);

                    if (selected) {
                        this._.bandControls.q.setDescription(params[band.index.q].description);

                    }
                }

                if (params[band.index.q].value !== undefined) {
                    band.params.q = params[band.index.q].value;

                    if (selected) {
                        this._.bandControls.q.setValue(params[band.index.q].value);

                    }
                }
            }

            if (band.index.type !== null && params[band.index.type] !== undefined) {
                if (params[band.index.type].description !== undefined) {
                    band.elms.type.text(params[band.index.type].description);

                }

                if (params[band.index.type].value !== undefined) {
                    band.params.type = params[band.index.type].value;

                    if (selected) {
                        this._.bandControls.type.setValue(params[band.index.type].value);

                    }
                }
            }

            if (band.index.active !== null && params[band.index.active] !== undefined && params[band.index.active].value !== undefined) {
                active = this._.eq.isActive(params[band.index.active].value);

                if (active !== band.params.active) {
                    this._toggleActive(band, active);

                }
            }

            if (!band.dragging && (gain !== null || freq !== null)) {
                gain === null && (gain = band.params.gain);
                freq === null && (freq = band.params.frequency);
                this._updatePoint(band, freq, gain);

            }
        },

        _updatePoint: function (band, frequency, gain) {
            frequency = Math.max(0, Math.min(1, frequency));
            gain = Math.max(0, Math.min(1, gain));

            var x = this._.size.width * frequency,
                y = this._.size.height * gain;

            band.elms.point.css('transform', 'translate(' + x.toFixed(3) + 'px, -' + y.toFixed(3) + 'px)');
            band.params.frequency = frequency;
            band.params.gain = gain;

        },

        _getBand: function (index) {
            if (this._.bands[index] === undefined) {
                this._.bands[index] = this._createBand(index);

            }

            return this._.bands[index];

        },

        _toggleActive: function (band, active) {
            if (active) {
                band.elms.btnActive.addClass('active');
                band.elms.point.removeClass('inactive');

            } else {
                band.elms.btnActive.removeClass('active');
                band.elms.point.addClass('inactive');

            }

            band.params.active = active;

        },

        _handleToggle: function (evt) {
            evt.preventDefault();

            if (evt.type === 'touchstart') {
                var elm = $(evt.currentTarget),
                    index = elm.data('index'),
                    band = this._.bands[index],
                    defaults = null;

                if (!band.params.active) {
                    defaults = this._.eq.onActivate(band.index.base, band.params);

                }

                this._toggleActive(band, !band.params.active);
                this._.options.onChange(band.index.active, '/value', this._.eq.convertActive(band.params.active));
                this._sendDefaults(defaults);

                if (!band.params.active && band === this._.selectedBand) {
                    this._selectBand(null);

                }
            }
        },

        _selectBand: function (band) {
            if (this._.selectedBand) {
                this._.selectedBand.elms.panel.removeClass('selected');

            }

            if (band === null) {
                this._.elms.bandPanelHolder.css('display', 'none');
                this._.elms.mainPanelHolder.css('display', '');
                this._.selectedBand = null;

                return;

            }

            this._.bandControls.frequency.setValue(band.params.frequency);
            this._.bandControls.gain.setValue(band.params.gain);
            this._.bandControls.q.setValue(band.params.q);

            if (this._.eq.features.bands.type) {
                this._.bandControls.type.setValue(band.params.type);

            }

            if (!this._.selectedBand) {
                this._.elms.mainPanelHolder.css('display', 'none');
                this._.elms.bandPanelHolder.css('display', '');

            }

            band.elms.panel.addClass('selected');
            this._.selectedBand = band;

        },

        _handlePointDrag: function (tsevt) {
            tsevt.preventDefault();

            var elm = $(tsevt.currentTarget),
                index = elm.data('index'),
                band = this._.bands[index],
                touch = _.find(tsevt.originalEvent.touches, function(touch) { return band.elms.point.is(touch.target); }, this);

            if (touch) {
                this._handleDrag(band, tsevt, touch, false, false);

            }
        },

        _handlePanelDrag: function (tsevt) {
            if (tsevt.isDefaultPrevented()) {
                return;

            }

            tsevt.preventDefault();

            var elm = $(tsevt.currentTarget),
                index = elm.data('index'),
                band = this._.bands[index],
                touch = _.find(tsevt.originalEvent.touches, function(touch) { return band.elms.panel.is(touch.target) || $.contains(band.elms.panel[0], touch.target); }, this),
                select = true;

            if (!touch) {
                return;

            }

            if (this._.eq.features.bands.active && !band.params.active) {
                this._handleNewDrag(band, tsevt, touch);
                return;

            }

            var handleTouch = function (evt) {
                var touch = _.find(evt.originalEvent.touches, function (touch) { return this._.elms.graph.is(touch.target); }.bind(this));

                if (touch) {
                    select = false;
                    handleRelease();
                    this._handleDrag(band, evt, touch, false, false);

                }
            }.bind(this);

            var handleRelease = function (teevt) {
                if (teevt && !_.find(teevt.originalEvent.changedTouches, function (t) { return t.identifier === touch.identifier; })) {
                    return;

                }

                this._.elms.graph.off('touchstart', handleTouch);
                $d.off('touchend', handleRelease);

                if (select) {
                    if (this._.selectedBand === band) {
                        this._selectBand(null);

                    } else {
                        this._selectBand(band);

                    }
                }
            }.bind(this);

            this._.elms.graph.on('touchstart', handleTouch);
            $d.on('touchend', handleRelease);

        },

        _handleNotch: function (tsevt) {
            tsevt.preventDefault();

            var touch = _.find(tsevt.originalEvent.touches, function(touch) { return this._.elms.btnNotch.is(touch.target); }, this),
                band = _.find(this._.bands, function(b) { return !b.params.active; }),
                notch;

            if (!touch || !band) {
                return;

            }

            this._updatePoint(band, 1, 0.5);
            this._toggleActive(band, true);

            notch = this._.eq.notch;
            this._.options.onChange(band.index.active, '/value', this._.eq.convertActive(true));
            this._.options.onChange(band.index.type, '/value', notch.setup.type);
            this._.options.onChange(band.index.gain, '/value', notch.setup.gain);
            this._.options.onChange(band.index.q, '/value', notch.setup.q);

            this._handleDrag(band, tsevt, touch, false, true, function() {
                this._.options.onChange(band.index.type, '/value', notch.active.type);
                this._.options.onChange(band.index.gain, '/value', notch.active.gain);
                this._.options.onChange(band.index.q, '/value', notch.active.q);

            });
        },

        _handleDrag: function (band, tsevt, touch, lockFreq, lockGain, onRelease) {
            band.dragging = true;
            band.elms.panel.addClass('focus');

            var freq = band.params.frequency,
                gain = band.params.gain,
                startX = touch.pageX,
                startY = touch.pageY;

            lockFreq || this._.options.onChange(band.index.frequency, '/touch', 1);
            lockGain || this._.options.onChange(band.index.gain, '/touch', 1);

            var handleMove = function (tmevt) {
                tmevt.preventDefault();

                var t = _.find(tmevt.originalEvent.touches, function (t) { return t.identifier === touch.identifier; }),
                    f, g;

                if (!t) {
                    handleRelease();

                }

                f = lockFreq ? freq : ((t.pageX - startX) / this._.size.width + freq);
                g = lockGain ? gain : ((startY - t.pageY) / this._.size.height + gain);
                f = Math.max(0, Math.min(1, f));
                g = Math.max(0, Math.min(1, g));
                this._updatePoint(band, f, g);

                lockFreq || this._.options.onChange(band.index.frequency, '/value', f);
                lockGain || this._.options.onChange(band.index.gain, '/value', g);

            }.bind(this);

            var handleRelease = function (teevt) {
                if (teevt && !_.find(teevt.originalEvent.changedTouches, function (t) { return t.identifier === touch.identifier; })) {
                    return;

                }

                $d.off('touchmove', handleMove);
                $d.off('touchend', handleRelease);
                band.dragging = false;
                band.elms.panel.removeClass('focus');

                lockFreq || this._.options.onChange(band.index.frequency, '/touch', 0);
                lockGain || this._.options.onChange(band.index.gain, '/touch', 0);
                onRelease && onRelease.call(this, band);

            }.bind(this);

            $d.on('touchmove', handleMove);
            $d.on('touchend', handleRelease);

        },

        _handleNewDrag: function (band, tsevt, touch) {
            band.dragging = true;
            band.elms.panel.addClass('focus');

            var offset = this._.elms.graph.offset(),
                x = 0, y = 0;

            var handleMove = function (tmevt) {
                tmevt.preventDefault();

                var t = _.find(tmevt.originalEvent.touches, function (t) { return t.identifier === touch.identifier; });

                if (!t) {
                    handleRelease();

                }

                x = t.pageX;
                y = t.pageY;

            }.bind(this);

            var handleRelease = function (teevt) {
                if (teevt && !_.find(teevt.originalEvent.changedTouches, function (t) { return t.identifier === touch.identifier; })) {
                    return;

                }

                $d.off('touchmove', handleMove);
                $d.off('touchend', handleRelease);
                band.dragging = false;
                band.elms.panel.removeClass('focus');

                if (x >= offset.left && x <= (offset.left + this._.size.width) && y >= offset.top && y <= (offset.top + this._.size.height)) {
                    var f = Math.max(0, Math.min(1, (x - offset.left) / this._.size.width)),
                        g = 1 - Math.max(0, Math.min(1, (y - offset.top) / this._.size.height)),
                        defaults = this._.eq.onActivate(band.index.base, band.params);

                    this._toggleActive(band, true);
                    this._updatePoint(band, f, g);
                    this._selectBand(band);

                    this._.options.onChange(band.index.active, '/value', this._.eq.convertActive(true));
                    this._.options.onChange(band.index.frequency, '/value', f);
                    this._.options.onChange(band.index.gain, '/value', g);
                    this._sendDefaults(defaults);

                }
            }.bind(this);

            $d.on('touchmove', handleMove);
            $d.on('touchend', handleRelease);

        },

        _sendDefaults: function (defaults) {
            if (defaults) {
                _.each(defaults, function (msg) {
                    this._.options.onChange(msg.param, '/value', msg.value);

                }.bind(this));
            }
        },

        _createBand: function (index) {
            var band = {
                dragging: false,
                elms: {
                    point: $('<span></span>'),
                    panel: $('<div></div>')
                },
                params: {
                    frequency: null,
                    gain: null,
                    q: null,
                    active: undefined,
                    type: null
                },
                index: {
                    base: index,
                    frequency: this._.eq.mapBand(index, 'frequency'),
                    gain: this._.eq.mapBand(index, 'gain'),
                    q: this._.eq.mapBand(index, 'q'),
                    active: this._.eq.mapBand(index, 'active'),
                    type: this._.eq.mapBand(index, 'type')
                }
            };

            band.elms.point.addClass('fxeditor-eq-graph-point');
            band.elms.panel.addClass('fxeditor-eq-band');

            this._.elms.graph.append(band.elms.point);

            (function() {
                var i;

                for (i = index - 1; i >= 0; i--) {
                    if (this._.bands[i]) {
                        this._.bands[i].elms.panel.after(band.elms.panel);
                        return;

                    }
                }

                for (i = index + 1; i < this._.bands.length; i++) {
                    if (this._.bands[i]) {
                        this._.bands[i].elms.panel.before(band.elms.panel);
                        return;

                    }
                }

                this._.elms.bands.append(band.elms.panel);

            }.bind(this))();

            band.elms.point.attr('data-index', index + 1);
            band.elms.point.data('index', index);
            band.elms.panel.data('index', index);

            if (this._.eq.features.bands.active) {
                band.elms.btnActive = $('<button></button>');
                band.elms.btnActive.addClass('fxeditor-eq-band-btnActive');
                band.elms.btnActive.data('index', index);
                band.elms.panel.append(band.elms.btnActive);

            }

            band.elms.panel.append(
                $('<span></span>').addClass('fxeditor-eq-band-name').text(index + 1)
            );

            if (this._.eq.features.bands.type) {
                band.elms.type = $('<span></span>');
                band.elms.type.addClass('fxeditor-eq-band-field fxeditor-eq-band-type');
                band.elms.panel.append(band.elms.type);

            }

            if (this._.eq.features.bands.frequency) {
                band.elms.frequency = $('<span></span>');
                band.elms.frequency.addClass('fxeditor-eq-band-field fxeditor-eq-band-frequency');
                band.elms.frequency.data('param', 'frequency');
                band.elms.frequency.data('index', index);
                band.elms.panel.append(band.elms.frequency);

            }

            if (this._.eq.features.bands.gain) {
                band.elms.gain = $('<span></span>');
                band.elms.gain.addClass('fxeditor-eq-band-field fxeditor-eq-band-gain');
                band.elms.gain.data('param', 'gain');
                band.elms.gain.data('index', index);
                band.elms.panel.append(band.elms.gain);

            }

            if (this._.eq.features.bands.q) {
                band.elms.q = $('<span></span>');
                band.elms.q.addClass('fxeditor-eq-band-field fxeditor-eq-band-q');
                band.elms.q.data('param', 'q');
                band.elms.q.data('index', index);
                band.elms.panel.append(band.elms.q);

            }

            return band;

        },

        _addParams: function () {
            _.each(this._.eq.features.params, function (param, index) {
                var widget = this._createParam(param, index);
                widget.attach(this._.elms.mainPanel);
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
                case 'frequency':
                case 'gain':
                case 'q':
                case 'type':
                    if (!this._.selectedBand) {
                        return;

                    }

                    param = this._.selectedBand.index[param];
                    break;

                default:
                    param = this._.eq.features.params[param].index;
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

        _createKnob: function (index, options) {
            return new Controls.Knob(_.extend({
                zeroSnap: false,
                onChange: this._getChangeHandler(index, '/value'),
                onTouch: this._getChangeHandler(index, '/touch')
            }, _.pick(options || {}, ['zeroPos', 'zeroSnap'])));
        },

        _createSelect: function (index, items) {
            return new Controls.Select({
                className: 'panel-select',
                items: items,
                onChange: this._getChangeHandler(index, '/value'),
                onTouch: this._getChangeHandler(index, '/touch')
            });
        },

        _createToggle: function (index, options) {
            return new Controls.Toggle(_.extend({
                onChange: this._getChangeHandler(index, '/value'),
                onTouch: this._getChangeHandler(index, '/touch')
            }, _.pick(options || {}, ['stateToValue', 'valueToState'])));
        },

        _drawRulers: function () {
            if (!this._.eq.rulers || !this._.size.width) {
                if (this._.canvas) {
                    this._.elms.graphRulers.prop({
                        width: this._.size.width,
                        height: this._.size.height
                    });
                }

                return;

            }

            if (!this._.canvas) {
                this._.canvas = this._.elms.graphRulers[0].getContext('2d');

            }

            this._.elms.graphRulers.prop({
                width: this._.size.width,
                height: this._.size.height
            });

            var i, label, value, x, y,
                X = this._.size.width,
                Y = this._.size.height,
                rulers = this._.eq.rulers;

            this._.canvas.font = '14px sans-serif';

            this._.canvas.fillStyle = '#262626';
            this._.canvas.fillRect(0, 0, X, Y);

            this._.canvas.strokeStyle = '#333333';
            this._.canvas.fillStyle = '#828282';

            for (i = 0; i < rulers.gain.values.length; i++) {
                value = rulers.gain.values[i];
                label = rulers.gain.labels[i];

                x = label ? 0 : 24;
                y = Y - Math.round(value * Y) + 0.5;

                this._.canvas.moveTo(x, y);
                this._.canvas.lineTo(X, y);

                if (label) {
                    this._.canvas.fillText(label, 4, y - 7);

                }
            }

            for (i = 0; i < rulers.frequency.values.length; i++) {
                value = rulers.frequency.values[i];
                label = rulers.frequency.labels[i];

                x = Math.round(value * X) + 0.5;
                y = label ? Y : (Y - 20);

                this._.canvas.moveTo(x, 0);
                this._.canvas.lineTo(x, y);

                if (label) {
                    x -= this._.canvas.measureText(label).width;
                    this._.canvas.fillText(label, x - 5, Y - 6);

                }
            }

            this._.canvas.stroke();
            this._.canvas.beginPath();

            y = Math.round(Y * 0.5) + 0.5;
            this._.canvas.strokeStyle = '#f8c249';
            this._.canvas.moveTo(0, y);
            this._.canvas.lineTo(X, y);
            this._.canvas.stroke();

        }
    });

})(jQuery, jQuery(document), _);