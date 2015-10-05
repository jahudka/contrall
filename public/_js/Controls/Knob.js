(function($, $d, _) {
    "use strict";

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {});

    var Knob = Controls.Knob = function(options) {
        this._ = {
            options: _.defaults(options || {}, Knob.defaults),
            elms: {
                holder: $('<div></div>'),
                label: $('<span></span>'),
                value: $('<span></span>'),
                track: $('<span></span>'),
                button: $('<span></span>'),
                arrow: $('<span></span>')
            },
            name: '',
            value: null,
            description: ''
        };

        this._.value = this._.options.zeroPos;

        this._.elms.holder.addClass('knob');
        this._.elms.label.addClass('knob-label');
        this._.elms.value.addClass('knob-value');
        this._.elms.track.addClass('knob-track');
        this._.elms.button.addClass('knob-button');
        this._.elms.arrow.addClass('knob-arrow');

        this._.elms.holder.append(
            this._.elms.track,
            this._.elms.label,
            this._.elms.value
        );

        this._.elms.track.append(this._.elms.button, this._.elms.arrow);

        this._.elms.track.on('touchstart', this._handleTouch.bind(this));

    };

    Knob.defaults = {
        zeroPos: 0,
        zeroSnap: true,
        snapThreshold: 0.04,
        scale: true,
        scaleThreshold: 120,
        scaleAmount: 0.2,
        trackSize: 240,
        onChange: _.noop,
        onTouch: _.noop
    };

    _.extend(Knob.prototype, {
        attach: function (container) {
            this._.elms.holder.appendTo(container);
            return this;

        },

        reposition: function () {
            // noop
        },

        setValue: function (value) {
            if (this._.value !== value) {
                this._.value = value;

                value = 270 * (this._.value === null ? 0 : this._.value) - 45;
                this._.elms.arrow.css('transform', 'rotate(' + value.toFixed(3) + 'deg) translateZ(0)');

            }

            return this;

        },

        getValue: function () {
            return this._.value;

        },

        setDescription: function (description) {
            if (this._.description !== description) {
                this._.description = description;
                this._.elms.value.text(this._.description);

            }

            return this;

        },

        getDescription: function () {
            return this._.description;

        },

        setName: function (name) {
            if (this._.name !== name) {
                this._.name = name;
                this._.elms.label.text(this._.name);

            }

            return this;

        },

        _handleTouch: function (tsevt) {
            tsevt.preventDefault();

            var touch = _.find(tsevt.originalEvent.touches, function(touch) { return this._.elms.track.is(touch.target) || $.contains(this._.elms.track[0], touch.target); }, this);

            if (!touch) {
                return;

            }

            var touchV = touch.pageX,
                scale = false,
                center = null,
                start = this._.value,
                offset = touch.pageY;

            this._.elms.holder.addClass('knob-dragging');
            this._.options.onTouch(true);

            var handleMove = function (tmevt) {
                tmevt.preventDefault();

                var t = _.find(tmevt.originalEvent.touches, function (t) { return t.identifier === touch.identifier; }),
                    v;

                if (!t) {
                    handleRelease();

                }

                if (this._.options.scale) {
                    if (Math.abs(t.pageX - touchV) >= this._.options.scaleThreshold) {
                        if (!scale) {
                            scale = true;
                            center = this._.value;

                        }
                    } else {
                        if (scale) {
                            scale = false;

                        }
                    }
                }

                v = start + (offset - t.pageY) / this._.options.trackSize;

                if (scale) {
                    v = (v - center) * this._.options.scaleAmount + center;

                } else if (this._.options.zeroSnap && Math.abs(this._.options.zeroPos - v) <= this._.options.snapThreshold) {
                    v = this._.options.zeroPos;

                }

                v = Math.min(1, Math.max(0, v));

                this.setValue(v);
                this._.options.onChange(this.getValue());

            }.bind(this);

            var handleRelease = function (teevt) {
                if (teevt && !_.find(teevt.originalEvent.changedTouches, function (t) { return t.identifier === touch.identifier; })) {
                    return;

                }

                $d.off('touchmove', handleMove);
                $d.off('touchend', handleRelease);
                this._.elms.holder.removeClass('knob-dragging');
                this._.options.onTouch(false);

            }.bind(this);

            $d.on('touchmove', handleMove);
            $d.on('touchend', handleRelease);

        }
    });

})(jQuery, jQuery(document), _);