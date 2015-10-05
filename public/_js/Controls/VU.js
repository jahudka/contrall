(function ($, $d, _) {
    "use strict";

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {});

    var VU = Controls.VU = function (options) {
        this._ = {
            options: _.defaults(options || {}, VU.defaults),
            elms: {
                holder: $('<div></div>'),
                channels: [],
                peaks: [],
                segments: [],
                labels: []
            },
            pending: false,
            values: [],
            peaks: [],
            peakResetTimeouts: [],
            peakResetCallbacks: [],
            segmentSize: 0
        };

        this._.elms.holder.addClass('vu');

        if (this._.options.horizontal) {
            this._.elms.holder.addClass('vu-horizontal');

        } else {
            this._.elms.holder.addClass('vu-vertical');

        }

        this._createChannels();
        this._.elms.holder.on('click', this._handleClick.bind(this));

    };

    VU.defaults = {
        horizontal: false,
        peakHold: 5000,
        channels: 2,
        labels: true,
        labelSpacing: 6,
        labelRange: 64
    };

    _.extend(VU.prototype, {
        attach: function (container) {
            this._.elms.holder.appendTo(container);
            return this;

        },

        reposition: function () {
            if (this._.options.horizontal) {
                this._.segmentSize = this._.elms.channels[0].width() - this._.elms.peaks[0].outerHeight(true);

            } else {
                this._.segmentSize = this._.elms.channels[0].height() - this._.elms.peaks[0].outerHeight(true);

            }

            if (!this._.options.labels) {
                return this;

            }

            this._.elms.holder.children('.vu-label').remove();

            var i, e, ofs,
                n = Math.floor(this._.options.labelRange / this._.options.labelSpacing),
                v = 0,
                p;

            if (this._.options.horizontal) {
                ofs = this._.elms.holder.offset().left + this._.elms.holder().outerWidth() - this._.elms.channels[0].offset().left - this._.elms.channels[0].width() - this._.elms.peaks[0].outerWidth(true);
                p = 'right';

            } else {
                ofs = this._.elms.channels[0].offset().top - this._.elms.holder.offset().top + this._.elms.peaks[0].outerHeight(true);
                p = 'top';

            }

            for (i = 0; i < n; i++, v += this._.options.labelSpacing) {
                e = $('<span></span>');
                e.addClass('vu-label');
                e.append($('<span></span>').text(v));
                e.css(p, ofs + (v / this._.options.labelRange) * this._.segmentSize);
                this._.elms.holder.append(e);

            }

            return this;

        },

        setValues: function (values) {
            var i = 0;

            for (; i < values.length; i++) {
                if (typeof values[i] !== 'undefined') {
                    this.setValue(i, values[i]);

                }
            }

            this._.pending = true;

            return this;

        },

        setValue: function (index, value) {
            if (this._.values[index] !== value) {
                this._.values[index] = value;

                var v, p,
                    prop = this._.options.horizontal ? 'scaleX' : 'scaleY';

                v = Math.min(value / 0.9, 1);
                p = value >= 0.9;

                if (p) {
                    if (!this._.peaks[index]) {
                        this._.elms.peaks[index].css('opacity', 1);
                        this._.peaks[index] = true;

                    }

                    if (this._.peakResetTimeouts[index]) {
                        window.clearTimeout(this._.peakResetTimeouts[index]);

                    }

                    this._.peakResetTimeouts[index] = window.setTimeout(this._.peakResetCallbacks[index], this._.options.peakHold);

                }

                this._.elms.segments[index].css('transform', prop + '(' + v.toFixed(3) + ') translateZ(0)');

            }

            return this;

        },

        _createChannels: function () {
            var i, c, e;

            for (i = 0; i < this._.options.channels; i++) {
                c = $('<div></div>');
                c.addClass('vu-channel');
                this._.elms.holder.append(c);
                this._.elms.channels.push(c);

                e = $('<span></span>');
                e.addClass('vu-peak');
                c.append(e);
                this._.elms.peaks.push(e);

                e = $('<span></span>');
                e.addClass('vu-segment');
                c.append(e);
                this._.elms.segments.push(e);

                this._.values.push(0);
                this._.peaks.push(false);
                this._.peakResetTimeouts.push(null);
                this._.peakResetCallbacks.push(this._getPeakReset(i));

            }
        },

        _getPeakReset: function (i) {
            return function () {
                this._resetPeak(i);

            }.bind(this);
        },

        _resetPeak: function (i) {
            this._.elms.peaks[i].css('opacity', 0);
            this._.peaks[i] = false;

            if (this._.peakResetTimeouts[i]) {
                window.clearTimeout(this._.peakResetTimeouts[i]);

            }

            this._.peakResetTimeouts[i] = null;

        },

        _resetAllPeaks: function () {
            for (var i = 0; i < this._.options.channels; i++) {
                this._.peakResetCallbacks[i]();

            }
        },

        _handleClick: function (evt) {
            evt.preventDefault();
            this._resetAllPeaks();

        }
    });

})(jQuery, jQuery(document), _);