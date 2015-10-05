(function($, _, osc) {

    var Contrall = window.Contrall || (window.Contrall = {});

    var App = Contrall.App = function (options) {
        this._ = {
            options: _.defaults(options || {}, App.defaults),
            layers: {
                mixer: null,
                aux: null,
                fx: null
            },
            widgets: {
                mixer: null,
                aux: null,
                fx: null
            },
            active: null,
            socket: null,
            store: null,
            root: $('#root'),
            lastReload: 0
        };
    };

    App.defaults = {
        trackBankSize: 8,
        trackInsertCount: 4,
        trackAuxCount: 8,
        fxParamBankSize: 24
    };

    _.extend(App.prototype, {
        sendMessage: function (address, args) {
            //console.log('MSG OUT', address, args);
            this._.store.handleLocalMessage(address, args);

            this._.socket.send({
                address: address,
                args: args
            });
        },

        setActive: function (widget, info) {
            if (!_.has(this._.widgets, widget)) {
                throw new Error("Unknown widget: '" + widget + "'");

            }

            if (this._.active) {
                this._.layers[this._.active].setActive(false);

            }

            this._.active = widget;
            this._.widgets[widget].setActive(info);

            var data = this._.store.getData(),
                key = widget === 'fx' ? 'fxParams' : 'tracks';

            if (data && !!data[key]) {
                this._.widgets[widget].update(data[key]);

            }

            this._.layers[widget].setActive(true);

        },

        selectFx: function (track, index) {
            this.sendMessage('/device/track/select/' + (track + 1), [1]);
            this.sendMessage('/device/fx/select/' + (index + 1), [1]);

        },

        reload: function () {
            if (Date.now() < this._.lastReload + 3000) {
                document.location.reload();

            } else {
                this.sendMessage('/action/41743', [1]);
                this._.lastReload = Date.now();

            }
        },

        getData: function () {
            return this._.store.getData();

        },

        run: function () {
            this._createStore();
            this._createSocket();
            this._createMixer();
            this._createAux();
            this._createFxEditor();

            this._reposition();

            this.setActive('mixer');

            $(window).on('resize orientationchange', this._reposition.bind(this));

            this._.socket.on('ready', this._sendInfo.bind(this));

            this._.socket.open();

        },



        _sendInfo: function () {
            this.sendMessage('/device/track/count', [this._.options.trackBankSize]);
            this.sendMessage('/device/fx/count', [this._.options.trackInsertCount]);
            this.sendMessage('/device/send/count', [this._.options.trackAuxCount]);
            this.sendMessage('/device/receive/count', [this._.options.trackAuxCount]);
            this.sendMessage('/action/41743', [1]);

        },

        _createSocket: function () {
            var sock = new osc.WebSocketPort({
                url: 'ws://' + document.location.host
            });

            sock.on('message', this._handleMessage.bind(this));

            this._.socket = sock;

        },

        _createStore: function () {
            var store = new Contrall.DataStore({
                trackBankSize: this._.options.trackBankSize,
                trackInsertCount: this._.options.trackInsertCount,
                trackSendCount: this._.options.trackAuxCount,
                trackReceiveCount: this._.options.trackAuxCount,
                fxParamBankSize: this._.options.fxParamBankSize
            });

            store.addListener(this._handleUpdate.bind(this));

            this._.store = store;

        },

        _createMixer: function () {
            this._.widgets.mixer = new Contrall.Controls.Mixer(this, {
                channels: this._.options.trackBankSize
            });

            this._.layers.mixer = new Contrall.Controls.Layer(this._.widgets.mixer);
            this._.layers.mixer.attach(this._.root);

        },

        _createAux: function () {
            this._.widgets.aux = new Contrall.Controls.AuxMixer(this, {
                channels: this._.options.trackAuxCount
            });

            this._.layers.aux = new Contrall.Controls.Layer(this._.widgets.aux);
            this._.layers.aux.attach(this._.root);

        },

        _createFxEditor: function () {
            this._.widgets.fx = new Contrall.Controls.FxEditor(this, {});

            this._.layers.fx = new Contrall.Controls.Layer(this._.widgets.fx);
            this._.layers.fx.attach(this._.root);

        },

        _handleMessage: function (msg) {
            //console.log('MSG IN', msg.address, msg.args);
            this._.store.handleMessage(msg.address, msg.args);

        },

        _reposition: function () {
            _.each(this._.widgets, function (widget) {
                widget.reposition();

            });
        },

        _handleUpdate: function (data) {
            var key = this._.active === 'fx' ? 'fxParams' : 'tracks';

            if (this._.active && _.has(data, key)) {
                //console.log('updating ' + this._.active);
                this._.widgets[this._.active].update(data[key]);

            }
        }
    });

})(jQuery, _, osc);