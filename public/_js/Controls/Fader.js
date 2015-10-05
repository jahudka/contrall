(function ($, $d, _) {
    "use strict";

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {});

    // track color #000
    // bg color #262626
    // border color #131313
    // small fader track #2b2b2b
    // small fader bg #333333

    var Fader = Controls.Fader = function (options) {
        this._ = {
            options: _.defaults(options || {}, Fader.defaults),
            elms: {
                holder: $('<div></div>'),
                label: $('<span></span>'),
                track: $('<div></div>'),
                handle: $('<span></span>')
            },
            value: 0,
            label: null,
            labelTmr: null,
            sizeProp: null,
            posProp: null,
            touchValueProp: null,
            touchScaleProp: null,
            transformDirection: 1,
            size: null
        };

        this._.value = this._.options.zeroPos;
        this.setLabel('');

        if (this._.options.horizontal) {
            this._.sizeProp = 'width';
            this._.posProp = 'translateX';
            this._.touchValueProp = 'pageX';
            this._.touchScaleProp = 'pageY';

        } else {
            this._.sizeProp = 'height';
            this._.posProp = 'translateY';
            this._.touchValueProp = 'pageY';
            this._.touchScaleProp = 'pageX';
            this._.transformDirection = -1;

        }

        this._.elms.holder.addClass('fader');
        this._.elms.label.addClass('fader-label');
        this._.elms.handle.addClass('fader-handle');
        this._.elms.track.addClass('fader-track');
        this._.elms.holder.append(this._.elms.label, this._.elms.track);
        this._.elms.track.append(this._.elms.handle);

        if (this._.options.horizontal) {
            this._.elms.holder.addClass('fader-horizontal');

        } else {
            this._.elms.holder.addClass('fader-vertical');

        }

        this._.elms.handle.on('touchstart', this._handleTouch.bind(this));

    };

    Fader.defaults = {
        horizontal: false,
        zeroPos: 0.75,
        zeroSnap: true,
        snapThreshold: 0.04,
        scale: true,
        scaleThreshold: 120,
        scaleAmount: 0.3,
        filterIn: null,
        filterOut: null,
        onChange: _.noop,
        onTouch: _.noop,
        applyLabel: function (elm, label) {
            elm.text(label);

        }
    };

    _.extend(Fader.prototype, {
        attach: function (container) {
            this._.elms.holder.appendTo(container);
            return this;

        },

        reposition: function () {
            this._.size = this._.elms.track[this._.sizeProp]();
            this.setRawValue(this.getRawValue(), true);

        },

        setValue: function (value) {
            return this.setRawValue(this._.options.filterIn ? this._.options.filterIn(value) : value);

        },

        getValue: function () {
            var value = this.getRawValue();
            return this._.options.filterOut ? this._.options.filterOut(value) : value;

        },

        setRawValue: function (value, force) {
            value = Math.max(0, Math.min(1, value));

            if (this._.value !== value || force) {
                this._.value = value;
                value = this._.transformDirection * this._.value * this._.size;
                this._.elms.handle.css('transform', this._.posProp + '(' + value.toFixed(3) + 'px) translateZ(0)');

            }

            return this;
        },

        getRawValue: function () {
            return this._.value;

        },

        setLabel: function (label) {
            if (this._.label !== label) {
                this._.label = label;
                this._.options.applyLabel.call(this, this._.elms.label, label);

            }

            return this;

        },

        _handleTouch: function (tsevt) {
            tsevt.preventDefault();

            var touch = _.find(tsevt.originalEvent.touches, function(touch) { return this._.elms.handle.is(touch.target); }, this),
                touchV = touch[this._.touchScaleProp],
                calc,
                scale = false,
                center = null;

            if (!touch) return;

            if (this._.options.horizontal) {
                calc = (function(ofs) {
                    return function (v) {
                        return v - ofs;
                    };
                })(this._.elms.track.offset().left);

            } else {
                calc = (function (ofs) {
                    return function (v) {
                        return ofs - v;
                    };
                })(this._.elms.track.offset().top + this._.elms.track.height());

            }

            this._.elms.holder.addClass('fader-dragging');
            this._.options.onTouch(true);

            var handleMove = function (tmevt) {
                tmevt.preventDefault();

                var t = _.find(tmevt.originalEvent.touches, function (t) { return t.identifier === touch.identifier; }),
                    v;

                if (!t) {
                    handleRelease();

                }

                if (this._.options.scale) {
                    if (Math.abs(t[this._.touchScaleProp] - touchV) >= this._.options.scaleThreshold) {
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

                v = calc(t[this._.touchValueProp]) / this._.size;

                if (scale) {
                    v = (v - center) * this._.options.scaleAmount + center;

                } else if (this._.options.zeroSnap && Math.abs(this._.options.zeroPos - v) <= this._.options.snapThreshold) {
                    v = this._.options.zeroPos;

                }

                this.setRawValue(v);
                this._.options.onChange(this.getValue());

            }.bind(this);

            var handleRelease = function (teevt) {
                if (teevt && !_.find(teevt.originalEvent.changedTouches, function (t) { return t.identifier === touch.identifier; })) {
                    return;

                }

                $d.off('touchmove', handleMove);
                $d.off('touchend', handleRelease);
                this._.elms.holder.removeClass('fader-dragging');
                this._.options.onTouch(false);

            }.bind(this);

            $d.on('touchmove', handleMove);
            $d.on('touchend', handleRelease);

        }
    });

})(jQuery, jQuery(document), _);