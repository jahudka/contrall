(function($, $d, _, undefined) {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {}),
        Utils = window.Utils;



    var Channel = Controls.Channel = function (index, options) {
        this._ = {
            index: index,
            options: _.defaults(options || {}, Channel.defaults),
            name: '',
            number: '',
            solo: false,
            mute: false,
            selected: false,
            volumeTouch: false,
            panTouch: false,
            elms: {
                holder: $('<div></div>'),
                header: $('<div></div>'),
                inserts: $('<div></div>'),
                tools: $('<div></div>'),
                pan: $('<div></div>'),
                fader: $('<div></div>'),
                number: $('<span></span>'),
                name: $('<span></span>'),
                btnSends: $('<button></button>'),
                btnReceives: $('<button></button>'),
                btnSolo: $('<button></button>'),
                btnMute: $('<button></button>')
            },
            inserts: [],
            bypassTimer: null,
            fader: null,
            pan: null,
            vu: null
        };

        this._.elms.holder.addClass('channel');
        this._.elms.header.addClass('channel-header draggable-toggle');
        this._.elms.inserts.addClass('channel-inserts');
        this._.elms.tools.addClass('channel-tools');
        this._.elms.pan.addClass('channel-pan');
        this._.elms.fader.addClass('channel-fader');
        this._.elms.number.addClass('channel-number');
        this._.elms.name.addClass('channel-name');
        this._.elms.btnSends.addClass('channel-btnSends');
        this._.elms.btnReceives.addClass('channel-btnReceives');
        this._.elms.btnSolo.addClass('channel-btnSolo draggable-toggle');
        this._.elms.btnMute.addClass('channel-btnMute draggable-toggle');

        this._.elms.holder.append(
            this._.elms.header,
            this._.elms.inserts,
            this._.elms.tools,
            this._.elms.pan,
            this._.elms.fader
        );

        this._.elms.header.append(
            this._.elms.number,
            this._.elms.name
        );

        this._.elms.tools.append(
            this._.elms.btnSends,
            this._.elms.btnReceives,
            this._.elms.btnSolo,
            this._.elms.btnMute
        );

        for (var i = 0, c; i < 4; i++) {
            c = $('<span></span>');
            c.addClass('channel-insert channel-insert-empty');
            this._.elms.inserts.append(c);

            this._.inserts.push({
                elm: c,
                pending: false,
                name: null,
                bypassed: null
            });
        }

        this._.elms.header.data('type', 'selected');
        this._.elms.btnSolo.data('type', 'solo');
        this._.elms.btnMute.data('type', 'mute');

        this._.elms.inserts.on('touchstart', '.channel-insert', this._handleInsert.bind(this));
        this._.elms.tools.on('touchstart touchend', '.channel-btnSends, .channel-btnReceives', this._handleAux.bind(this));

        this._.fader = this._createFader();
        this._.pan = this._createPan();
        this._.vu = this._createVU();

    };

    Channel.defaults = {
        insertCount: 4,
        vuChannelCount: 2,
        onChange: _.noop,
        onVolumeTouch: _.noop,
        onVolumeChange: _.noop,
        onPanTouch: _.noop,
        onPanChange: _.noop,
        onInsertOpen: _.noop,
        onAuxOpen: _.noop
    };

    _.extend(Channel.prototype, {
        getIndex: function () {
            return this._.index;

        },

        getElement: function () {
            return this._.elms.holder;

        },

        isSelected: function () {
            return this._.selected;

        },

        isVolumeTouch: function () {
            return this._.volumeTouch;

        },

        isPanTouch: function () {
            return this._.panTouch;

        },

        getVolume: function () {
            return this._.fader.getValue();

        },

        setVolume: function (volume) {
            this._.fader.setValue(volume);
            return this;

        },

        getPan: function () {
            return this._.pan.getValue();

        },

        setPan: function (pan) {
            this._.pan.setValue(pan);
            return this;

        },

        attach: function (container) {
            this._.elms.holder.appendTo(container);

            this._.pan.attach(this._.elms.pan);
            this._.vu.attach(this._.elms.fader);
            this._.fader.attach(this._.elms.fader);

            return this;

        },

        reposition: function () {
            this._.pan.reposition();
            this._.vu.reposition();
            this._.fader.reposition();
            return this;

        },

        update: function (params) {
            this._updateParams(params);
            this._updateInserts(params);
            this._updateWidgets(params);

        },

        setToggleState: function (type, state) {
            var elm, val = 'active';

            switch (type) {
                case 'solo': elm = this._.elms.btnSolo; break;
                case 'mute': elm = this._.elms.btnMute; break;
                case 'selected': elm = this._.elms.holder; val = 'selected'; break;
                default: throw new Error('Unknown toggle: ' + type);
            }

            if (this._[type] !== state) {
                this._[type] = state;

                if (state) {
                    elm.addClass(val);

                } else {
                    elm.removeClass(val);

                }
            }

            return this;

        },

        getToggleState: function (type) {
            switch (type) {
                case 'solo':
                case 'mute':
                case 'selected':
                    return this._[type];

                default:
                    throw new Error('Unknown toggle: ' + type);

            }
        },

        dispatchToggleState: function (type) {
            switch (type) {
                case 'solo':
                case 'mute':
                    this._.options.onChange(this._.index, '/' + type, [this._[type] ? 1 : 0]);
                    break;

                case 'selected':
                    // noop
                    break;

                default:
                    throw new Error('Unknown toggle: ' + type);

            }
        },

        _updateParams: function (params) {
            if (params.number !== undefined && params.number !== this._.number) {
                this._.elms.number.text(this._.number = params.number);

            }

            if (params.name !== undefined && params.name !== this._.name) {
                this._.elms.name.text(this._.name = params.name);

            }

            if (params.solo !== undefined) {
                this.setToggleState('solo', params.solo);

            }

            if (params.mute !== undefined) {
                this.setToggleState('mute', params.mute);

            }
        },

        _updateInserts: function (params) {
            if (params.inserts !== undefined) {
                var i, inc, ins;

                for (i = 0; i < this._.options.insertCount; i++) {
                    if (params.inserts[i] === undefined) {
                        continue;

                    }

                    inc = params.inserts[i];
                    ins = this._.inserts[i];

                    if (inc.name !== undefined && inc.name !== ins.name) {
                        if (!ins.name) {
                            ins.elm.removeClass('channel-insert-empty');

                        }

                        ins.name = inc.name;
                        ins.elm.text(inc.name);

                        if (!ins.name) {
                            ins.elm.addClass('channel-insert-empty');

                        }
                    }

                    if (inc.bypassed !== undefined && inc.bypassed !== ins.bypassed) {
                        ins.bypassed = inc.bypassed;

                        if (ins.bypassed) {
                            ins.elm.addClass('channel-insert-bypassed');

                        } else {
                            ins.elm.removeClass('channel-insert-bypassed');

                        }
                    }
                }
            }
        },

        _updateWidgets: function (params) {
            if (params.volume !== undefined) {
                if (params.volume.value !== undefined) {
                    this._.fader.setValue(params.volume.value);

                }

                if (params.volume.description !== undefined) {
                    this._.fader.setLabel(params.volume.description);

                }
            }

            if (params.pan !== undefined) {
                if (params.pan.value !== undefined) {
                    this._.pan.setValue(params.pan.value);

                }

                if (params.pan.description !== undefined) {
                    this._.pan.setLabel(params.pan.description);

                }
            }

            if (params.vu !== undefined) {
                this._.vu.setValues(params.vu);

            }
        },

        _createFader: function () {
            return new Controls.Fader({
                zeroPos: Utils.faderTaper.dbToN(0),
                filterIn: Utils.faderTaper.dbToN,
                filterOut: Utils.faderTaper.nToDb,
                onChange: function (value) {
                    this._.options.onVolumeChange(this._.index, value);
                    this._.options.onChange(this._.index, '/volume/db', [value]);

                }.bind(this),
                onTouch: function (isTouch) {
                    this._.volumeTouch = isTouch;
                    this._.options.onVolumeTouch(this._.index, isTouch);
                    this._.options.onChange(this._.index, '/volume/touch', [isTouch ? 1 : 0]);

                }.bind(this),
                applyLabel: this._applyVolumeLabel
            });
        },

        _applyVolumeLabel: function (elm, label) {
            var w = 1482, h = 370,
                a = 38, b = 10, n = 37,
                x, y;

            if (!label || typeof label !== 'string') {
                x = w - a;
                y = h - b;

            } else if (label === '-inf dB') {
                x = w - a;
                y = h - 2 * b;

            } else {
                label = parseFloat(label.substr(0, label.length - 2));

                if (label < -132.0) {
                    x = w - a;
                    y = h - b;

                } else {
                    label = Math.round((label + 132) * 10);
                    x = Math.floor(label / n) * a;
                    y = (label % n) * b;

                }
            }

            elm.css('background-position', (-x) + 'px ' + (-y) + 'px');

        },

        _createPan: function () {
            return new Controls.Fader({
                horizontal: true,
                zeroPos: 0.5,
                onChange: function (value) {
                    this._.options.onPanChange(this._.index, value);
                    this._.options.onChange(this._.index, '/pan', [value]);

                }.bind(this),
                onTouch: function (isTouch) {
                    this._.panTouch = isTouch;
                    this._.options.onPanTouch(this._.index, isTouch);
                    this._.options.onChange(this._.index, '/pan/touch', [isTouch ? 1 : 0]);

                }.bind(this)
            });
        },

        _createVU: function () {
            return new Controls.VU({
                channels: this._.options.vuChannelCount
            });
        },

        _handleInsert: function (evt) {
            evt.preventDefault();

            var insert = $(evt.currentTarget).index();

            if (!this._.inserts[insert].name) {
                return;

            }

            if (this._.bypassTimer) {
                window.clearTimeout(this._.bypassTimer);

            }

            $d.one('touchend', function (e) {
                e.preventDefault();

                if (this._.bypassTimer) {
                    window.clearTimeout(this._.bypassTimer);

                    this._.options.onInsertOpen({
                        channel: {
                            index: this._.index,
                            name: this._.name
                        },
                        fx: {
                            index: insert,
                            name: this._.inserts[insert].name,
                            bypassed: this._.inserts[insert].bypassed
                        }
                    });
                }
            }.bind(this));

            this._.bypassTimer = window.setTimeout(function () {
                this._.bypassTimer = null;

                var v = !this._.inserts[insert].bypassed;

                this._.inserts[insert].bypassed = v;

                if (v) {
                    this._.inserts[insert].elm.addClass('channel-insert-bypassed');

                } else {
                    this._.inserts[insert].elm.removeClass('channel-insert-bypassed');

                }

                this._.options.onChange(this._.index, '/fx/' + (insert + 1) + '/bypass', [v ? 0 : 1]);

            }.bind(this), 400);

        },

        _handleAux: function (evt) {
            evt.preventDefault();

            if (evt.type === 'touchstart') {
                this._.options.onAuxOpen({
                    mode: evt.currentTarget.classList.contains('channel-btnSends') ? 'send' : 'receive',
                    channel: {
                        index: this._.index,
                        name: this._.name
                    }
                });
            }
        }
    });



})(jQuery, jQuery(document), _);