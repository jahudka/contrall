(function($, $d, _, undefined) {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {});



    var AuxChannel = Controls.AuxChannel = function (index, options) {
        this._ = {
            index: index,
            options: _.defaults(options || {}, AuxChannel.defaults),
            name: '',
            number: index + 1,
            selected: false,
            volumeTouch: false,
            panTouch: false,
            elms: {
                holder: $('<div></div>'),
                header: $('<div></div>'),
                pan: $('<div></div>'),
                fader: $('<div></div>'),
                number: $('<span></span>'),
                name: $('<span></span>')
            },
            fader: null,
            pan: null
        };

        this._.elms.holder.addClass('channel');
        this._.elms.header.addClass('channel-header draggable-toggle');
        this._.elms.pan.addClass('channel-pan');
        this._.elms.fader.addClass('channel-fader');
        this._.elms.number.addClass('channel-number');
        this._.elms.name.addClass('channel-name');

        this._.elms.holder.append(
            this._.elms.header,
            this._.elms.pan,
            this._.elms.fader
        );

        this._.elms.header.append(
            this._.elms.number,
            this._.elms.name
        );

        this._.elms.header.data('type', 'selected');
        this._.elms.number.text(this._.number);

        this._.fader = this._createFader();
        this._.pan = this._createPan();

    };

    AuxChannel.defaults = {
        onChange: _.noop,
        onVolumeTouch: _.noop,
        onPanTouch: _.noop
    };

    _.extend(AuxChannel.prototype, {
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
            this._.fader.attach(this._.elms.fader);

            return this;

        },

        reposition: function () {
            this._.pan.reposition();
            this._.fader.reposition();
            return this;

        },

        update: function (params) {
            this._updateParams(params);
            this._updateWidgets(params);

        },

        _updateParams: function (params) {
            if (params.name !== undefined && params.name !== this._.name) {
                this._.elms.name.text(this._.name = params.name);

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
        },

        setToggleState: function (type, state) {
            if (type !== 'selected') {
                throw new Error('Unknown toggle: ' + type);

            }

            if (this._.selected !== state) {
                this._.selected = state;

                if (state) {
                    this._.elms.holder.addClass('selected');

                } else {
                    this._.elms.holder.removeClass('selected');

                }
            }

            return this;

        },

        getToggleState: function (type) {
            if (type !== 'selected') {
                throw new Error('Unknown toggle: ' + type);

            }

            return this._.selected;

        },

        dispatchToggleState: function (type) {
            // noop
        },

        _createFader: function () {
            return new Controls.Fader({
                zeroPos: 0.7160000205039978,
                onChange: function (value) {
                    this._.options.onVolumeChange(this._.index, value);
                    this._.options.onChange(this._.index, '/volume', [value]);

                }.bind(this),
                onTouch: function (isTouch) {
                    this._.volumeTouch = isTouch;
                    this._.options.onVolumeTouch(this._.index, isTouch);
                    this._.options.onChange(this._.index, '/volume/touch', [isTouch ? 1 : 0]);

                }.bind(this)
            });
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
        }
    });



})(jQuery, jQuery(document), _);