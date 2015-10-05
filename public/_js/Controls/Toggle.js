(function($, $d, _) {
    "use strict";

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {});

    var Toggle = Controls.Toggle = function(options) {
        this._ = {
            options: _.defaults(options || {}, Toggle.defaults),
            elms: {
                holder: $('<div></div>'),
                label: $('<span></span>'),
                track: $('<span></span>'),
                button: $('<span></span>')
            },
            name: '',
            state: null
        };

        this._.elms.holder.addClass('toggle');
        this._.elms.label.addClass('toggle-label');
        this._.elms.track.addClass('toggle-track');
        this._.elms.button.addClass('toggle-button');

        this._.elms.holder.append(
            this._.elms.label,
            this._.elms.track
        );
        this._.elms.track.append(this._.elms.button);

        this._.elms.track.on('touchstart touchend', this._handleTouch.bind(this));

    };

    Toggle.defaults = {
        valueToState: function(v) { return !!v; },
        stateToValue: function(v) { return v ? 1 : 0; },
        onChange: _.noop,
        onTouch: _.noop
    };

    _.extend(Toggle.prototype, {
        attach: function (container) {
            this._.elms.holder.appendTo(container);
            return this;

        },

        reposition: function () {
            // noop
        },

        setValue: function (value) {
            this._setState(this._.options.valueToState(value));
            return this;

        },

        _setState: function (state) {
            if (this._.state !== state) {
                this._.state = state;

                if (this._.state) {
                    this._.elms.track.addClass('on');

                } else {
                    this._.elms.track.removeClass('on');

                }
            }
        },

        getValue: function () {
            return this._.options.stateToValue(this._.state);

        },

        setDescription: function (description) {
            // noop
            return this;

        },

        getDescription: function () {
            return '';

        },

        setName: function (name) {
            if (this._.name !== name) {
                this._.name = name;
                this._.elms.label.text(this._.name);

            }

            return this;

        },

        _handleTouch: function (evt) {
            evt.preventDefault();

            if (evt.type !== 'touchstart') {
                this._.options.onTouch(false);
                return;

            }

            this._.options.onTouch(true);
            this._setState(!this._.state);
            this._.options.onChange(this.getValue());

        }
    });

})(jQuery, jQuery(document), _);