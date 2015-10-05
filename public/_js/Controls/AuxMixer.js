(function($, _) {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {}),
        Utils = window.Utils;

    var AuxMixer = Controls.AuxMixer = Utils.extend(Controls.Mixer, function(app, options) {
        AuxMixer.Super.call(this, app, options);

        this._.mode = 'send';
        this._.track = -1;
        this._.data = [];

    });

    _.extend(AuxMixer.prototype, {
        _createChannels: function () {
            var onChange = this._handleChange.bind(this),
                onVolumeTouch = this._getTouchHandler('volume'),
                onPanTouch = this._getTouchHandler('pan'),
                onVolumeChange = this._getChangeHandler('volume'),
                onPanChange = this._getChangeHandler('pan');

            for (var i = 0; i < this._.options.channels; i++) {
                this._.channels.push(new Controls.AuxChannel(i, {
                    onChange: onChange,
                    onVolumeTouch: onVolumeTouch,
                    onVolumeChange: onVolumeChange,
                    onPanTouch: onPanTouch,
                    onPanChange: onPanChange
                }));
            }
        },

        _createHeader: function (header) {
            this._.elms.title = $('<div></div>');
            this._.elms.btnQuit = $('<button></button>');

            this._.elms.title.addClass('mixer-title');
            this._.elms.btnQuit.addClass('mixer-btnQuit btnClose');

            header.append(
                this._.elms.title,
                this._.elms.btnQuit
            );

            this._.elms.btnQuit.on('touchstart touchend', this._handleQuit.bind(this));

        },

        _handleQuit: function (evt) {
            evt.preventDefault();

            if (evt.type === 'touchstart') {
                return;

            }

            this._.app.setActive('mixer');

        },

        _getChannelAddress: function (index) {
            return '/track/' + (this._.track + 1) + '/' + (this._.mode === 'send' ? 'send' : 'recv') + '/' + (index + 1);

        },

        update: function (tracks) {
            if (typeof tracks[this._.track] === 'undefined') {
                return;

            }

            var src = this._.mode === 'send' ? tracks[this._.track].sends : tracks[this._.track].receives;

            if (typeof src === 'undefined') {
                return;

            }

            _.each(this._.channels, function (ch, i) {
                if (typeof src[i] !== 'undefined') {
                    ch.update(src[i]);

                }
            }.bind(this));
        },

        reposition: function () {
            _.each(this._.channels, function (channel) {
                channel.reposition();

            });

            return this;

        },


        setActive: function (info) {
            this._.track = info.channel.index;
            this._.mode = info.mode;

            this._.elms.title.empty();
            this._.elms.title.append(
                $('<span class="mixer-title-type"></span>').text((info.mode === 'send' ? 'Sends' : 'Receives') + ' for track'),
                $('<span class="mixer-title-name"></span>').text(info.channel.name)
            );

            var data = this._.app.getData();

            if (typeof data.tracks !== 'undefined') {
                this.update(data.tracks);

            }

            return this;

        }
    });

})(jQuery, _);