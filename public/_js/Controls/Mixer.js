(function($, $d, _) {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {});


    var Mixer = Controls.Mixer = function (app, options) {
        this._ = {
            app: app,
            options: _.defaults(options || {}, Mixer.defaults),
            elms: {
                holder: $('<div></div>'),
                header: $('<div></div>'),
                main: $('<div></div>'),
                channels: $('<div></div>')
            },
            selection: {
                items: [],
                values: null,
                type: null,
                master: null,
                value: null
            },
            channels: []
        };

        this._.elms.holder.addClass('mixer');
        this._.elms.header.addClass('mixer-header');
        this._.elms.main.addClass('mixer-main');
        this._.elms.channels.addClass('mixer-channels');

        this._.elms.holder.append(
            this._.elms.header,
            this._.elms.main
        );

        this._.elms.main.append(this._.elms.channels);

        this._createHeader(this._.elms.header);
        this._createChannels();

        this._.elms.holder.on('touchstart', '.channel .draggable-toggle', this._handleDraggable.bind(this));

    };

    Mixer.defaults = {
        channels: 8,
        channelInsertCount: 4,
        channelVuChannelCount: 2
    };

    _.extend(Mixer.prototype, {
        _createHeader: function (header) {
            this._.elms.title = $('<span></span>');
            this._.elms.bankLeft = $('<button></button>');
            this._.elms.bankRight = $('<button></button>');
            this._.elms.reload = $('<button></button>');

            this._.elms.title.addClass('mixer-title');
            this._.elms.bankLeft.addClass('mixer-btnBank mixer-btnBank-left btnPrev');
            this._.elms.bankRight.addClass('mixer-btnBank mixer-btnBank-right btnNext');
            this._.elms.reload.addClass('mixer-btnReload');

            this._.elms.title.text('Master Mix');

            header.append(
                this._.elms.title,
                this._.elms.bankLeft,
                this._.elms.bankRight,
                this._.elms.reload
            );

            header.on('touchstart touchend', '.mixer-btnBank', this._handleBank.bind(this));
            this._.elms.reload.on('touchstart touchend', this._handleReload.bind(this));

        },

        _createChannels: function () {
            var onChange = this._handleChange.bind(this),
                onVolumeTouch = this._getTouchHandler('volume'),
                onPanTouch = this._getTouchHandler('pan'),
                onVolumeChange = this._getChangeHandler('volume'),
                onPanChange = this._getChangeHandler('pan'),
                onInsertOpen = this._openInsert.bind(this),
                onAuxOpen = this._openAux.bind(this);

            for (var i = 0; i < this._.options.channels; i++) {
                this._.channels.push(new Controls.Channel(i, {
                    insertCount: this._.options.channelInsertCount,
                    vuChannelCount: this._.options.channelVuChannelCount,
                    onChange: onChange,
                    onVolumeTouch: onVolumeTouch,
                    onVolumeChange: onVolumeChange,
                    onPanTouch: onPanTouch,
                    onPanChange: onPanChange,
                    onInsertOpen: onInsertOpen,
                    onAuxOpen: onAuxOpen
                }));
            }
        },

        _getTouchHandler: function (type) {
            var getter = type === 'volume' ? 'getVolume' : 'getPan',
                filter = type === 'volume' ? function (v) {
                    return v === Number.NEGATIVE_INFINITY ? -132 : v;
                } : function (v) {
                    return v;
                };

            return function (index, state) {
                if (this._.selection.items.length && _.contains(this._.selection.items, this._.channels[index])) {
                    if (state && !this._.selection.master) {
                        this._.selection.master = index;
                        this._.selection.type = type;
                        this._.selection.value = filter(this._.channels[index][getter]());
                        this._.selection.values = _.map(this._.selection.items, function(ch) { return filter(ch[getter]()); });

                    } else if (!state && this._.selection.master === index && this._.selection.type === type) {
                        this._.selection.master = null;
                        this._.selection.type = null;
                        this._.selection.value = null;
                        this._.selection.values = null;

                    }
                }
            }.bind(this);
        },

        _getChangeHandler: function (type) {
            var addr = type === 'volume' ? '/volume/db' : '/pan',
                test = type === 'volume' ? 'isVolumeTouch' : 'isPanTouch',
                getter = type === 'volume' ? 'getVolume' : 'getPan',
                setter = type === 'volume' ? 'setVolume' : 'setPan',
                filter = type === 'volume' ? function (v) {
                    return v === Number.NEGATIVE_INFINITY ? -132 : v;
                } : function (v) {
                    return v;
                };

            return function (index, value) {
                if (this._.selection.items.length && this._.selection.master === index && this._.selection.type === type) {
                    _.each(this._.selection.items, function (ch, i) {
                        if (ch.getIndex() !== this._.selection.master && !ch[test]()) {
                            ch[setter](this._.selection.values[i] + filter(value) - this._.selection.value);
                            this._.app.sendMessage(this._getChannelAddress(ch.getIndex()) + addr, [ch[getter]()]);

                        }
                    }.bind(this));
                }
            }.bind(this);
        },

        _handleChange: function (index, address, args) {
            this._.app.sendMessage(this._getChannelAddress(index) + address, args);

        },

        _getChannelAddress: function (index) {
            return '/track/' + (index + 1);

        },

        _openInsert: function (info) {
            this._.app.setActive('fx', info);
        },

        _openAux: function (info) {
            this._.app.setActive('aux', info);
        },

        attach: function (container) {
            this._.elms.holder.appendTo(container);

            _.each(this._.channels, function (channel) {
                channel.attach(this._.elms.channels);

            }.bind(this));

            return this;

        },

        update: function (tracks) {
            _.each(this._.channels, function (ch, i) {
                if (typeof tracks[i] !== 'undefined') {
                    ch.update(tracks[i]);

                }
            });
        },

        reposition: function () {
            _.each(this._.channels, function (channel) {
                channel.reposition();

            });

            return this;

        },

        setActive: function () {
            // noop
        },

        _handleBank: function (evt) {
            evt.preventDefault();

            if (evt.type !== 'touchstart') {
                return;

            }

            var dir = evt.currentTarget.classList.contains('mixer-btnBank-left') ? '-' : '+';
            this._.app.sendMessage('/device/track/bank/' + dir, [1]);

        },

        _handleReload: function (evt) {
            evt.preventDefault();

            if (evt.type === 'touchstart') {
                this._.app.reload();

            }
        },

        _handleDraggable: function (tsevt) {
            tsevt.preventDefault();

            var touch = _.find(tsevt.originalEvent.touches, function (t) { return t.target === tsevt.currentTarget || $.contains(tsevt.currentTarget, t.target); }),
                touchX = touch.pageX,
                target = $(tsevt.currentTarget),
                channel = this._.channels[target.closest('.channel').index()],
                states = [],
                type = target.data('type'),
                v = !channel.getToggleState(type),
                lock = false,
                isToggle = true;

            _.each(this._.channels, function (ch) {
                states.push(ch.getToggleState(type));

            });

            var checkChannel = function (ch, x) {
                if (states[ch.getIndex()] === v) {
                    return;

                }

                if (x <= touchX) {
                    if (ch.getIndex() > channel.getIndex()) {
                        return;

                    }

                    isToggle = false;

                    if (ch.getElement().offset().left + ch.getElement().outerWidth() > x) {
                        ch.setToggleState(type, v);

                    } else {
                        ch.setToggleState(type, !v);

                    }
                } else {
                    if (ch.getIndex() < channel.getIndex()) {
                        return;

                    }

                    isToggle = false;

                    if (ch.getElement().offset().left < x) {
                        ch.setToggleState(type, v);

                    } else {
                        ch.setToggleState(type, !v);

                    }
                }
            };

            channel.setToggleState(type, v);

            var handleMove = function (tmevt) {
                if (lock) return;

                lock = true;

                var t = _.find(tmevt.originalEvent.touches, function (t) { return t.identifier === touch.identifier; });

                if (!t) {
                    lock = false;
                    handleRelease();
                    return;

                }

                window.requestAnimationFrame(function () {
                    _.each(this._.channels, function (channel) {
                        checkChannel(channel, t.pageX);

                    });

                    lock = false;

                }.bind(this));

            }.bind(this);

            var handleRelease = function (teevt) {
                if (teevt && !_.find(teevt.originalEvent.changedTouches, function (t) { return t.identifier === touch.identifier; })) {
                    return;

                }

                $d.off('touchmove', handleMove);
                $d.off('touchend', handleRelease);

                var changed = false;

                _.each(this._.channels, function (ch) {
                    if (ch !== channel && states[ch.getIndex()] !== ch.getToggleState(type)) {
                        ch.dispatchToggleState(type);
                        changed = true;

                    }
                });

                if (changed) {
                    channel.dispatchToggleState(type);

                } else if (isToggle) {
                    if (type !== 'selected' && this._.selection.items.length && _.contains(this._.selection.items, channel)) {
                        _.each(this._.selection.items, function (ch) {
                            if (states[ch.getIndex()] !== v) {
                                ch.setToggleState(type, v);

                            }

                            ch.dispatchToggleState(type);

                        })
                    } else {
                        channel.dispatchToggleState(type);

                    }
                } else {
                    channel.setToggleState(type, !v);

                }

                if (type === 'selected') {
                    this._updateSelection();

                }
            }.bind(this);

            $d.on('touchmove', handleMove);
            $d.on('touchend', handleRelease);

        },

        _updateSelection: function () {
            this._.selection.items = _.filter(this._.channels, function (ch) {
                return ch.isSelected();
            });
        }
    });

})(jQuery, jQuery(document), _);