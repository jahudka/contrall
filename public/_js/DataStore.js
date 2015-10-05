(function(_) {

    var Contrall = window.Contrall || (window.Contrall = {});

    var DataStore = Contrall.DataStore = function (options) {
        this._ = {
            options: _.defaults(options || {}, DataStore.defaults),
            data: {},
            incoming: {},
            pending: false,
            listeners: []
        };

        this._dispatchUpdate = this._dispatchUpdate.bind(this);

    };

    DataStore.defaults = {
        trackBankSize: 8,
        trackInsertCount: 4,
        trackSendCount: 8,
        trackReceiveCount: 8,
        fxParamBankSize: 24
    };

    _.extend(DataStore.prototype, {
        addListener: function (listener) {
            this._.listeners.push(listener);
            return this;

        },

        getData: function () {
            return this._.data;

        },

        handleMessage: function (address, args) {
            this._processMessage(this._.incoming, address, args);

            if (!this._.pending) {
                this._.pending = true;
                window.requestAnimationFrame(this._dispatchUpdate);

            }
        },

        handleLocalMessage: function (address, args) {
            this._processMessage(this._.data, address, args);

        },
        
        _processMessage: function (target, address, args) {
            var parts = address.replace(/^\//, '').split(/\//g);

            switch (parts[0]) {
                case 'track':
                    if (!parts[1] || !parts[1].match(/^\d+$/)) {
                        break;

                    }

                    parts[1] = parseInt(parts[1]) - 1;
                    target.tracks || (target.tracks = new Array(this._.options.trackBankSize));
                    target.tracks[parts[1]] || (target.tracks[parts[1]] = {});

                    switch (parts[2]) {
                        case 'number':
                            if (parts[3] !== 'str') {
                                break;

                            }
                        // intentionally no break

                        case 'name':
                            target.tracks[parts[1]][parts[2]] = args[0];
                            break;

                        case 'pan':
                            parts[3] === 'str' || (parts[3] = 'db');
                        // intentionally no break

                        case 'volume':
                            target.tracks[parts[1]][parts[2]] || (target.tracks[parts[1]][parts[2]] = {});

                            switch (parts[3]) {
                                case 'str':
                                    target.tracks[parts[1]][parts[2]].description = args[0];
                                    break;

                                case 'db':
                                    target.tracks[parts[1]][parts[2]].value = args[0];
                                    break;
                            }
                            break;

                        case 'recarm':
                            parts[2] = 'arm';
                        // intentionally no break

                        case 'solo':
                        case 'mute':
                            target.tracks[parts[1]][parts[2]] = !!args[0];
                            break;

                        case 'vu':
                            parts[3] = parts[3] === 'L' ? 0 : 1;
                            target.tracks[parts[1]].vu || (target.tracks[parts[1]].vu = new Array(2));
                            target.tracks[parts[1]].vu[parts[3]] = args[0];
                            break;

                        case 'fx':
                            parts[3] = parseInt(parts[3]) - 1;
                            target.tracks[parts[1]].inserts || (target.tracks[parts[1]].inserts = new Array(this._.options.trackInsertCount));
                            target.tracks[parts[1]].inserts[parts[3]] || (target.tracks[parts[1]].inserts[parts[3]] = {});

                            switch (parts[4]) {
                                case 'name':
                                    target.tracks[parts[1]].inserts[parts[3]].name = args[0];
                                    break;

                                case 'bypass':
                                    target.tracks[parts[1]].inserts[parts[3]].bypassed = !args[0];
                                    break;

                            }
                            break;

                        case 'send':
                        case 'recv':
                            parts[2] = parts[2] === 'send' ? 'sends' : 'receives';
                            parts[3] = parseInt(parts[3]) - 1;
                            target.tracks[parts[1]][parts[2]] || (target.tracks[parts[1]][parts[2]] = []);
                            target.tracks[parts[1]][parts[2]][parts[3]] || (target.tracks[parts[1]][parts[2]][parts[3]] = {});

                            switch (parts[4]) {
                                case 'name':
                                    target.tracks[parts[1]][parts[2]][parts[3]].name = args[0];
                                    break;

                                case 'volume':
                                case 'pan':
                                    parts[5] = parts[5] === 'str' ? 'description' : 'value';
                                    target.tracks[parts[1]][parts[2]][parts[3]][parts[4]] || (target.tracks[parts[1]][parts[2]][parts[3]][parts[4]] = {});
                                    target.tracks[parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = args[0];
                                    break;

                                case 'mute':
                                    target.tracks[parts[1]][parts[2]][parts[3]].mute = !!args[0];
                                    break;
                            }
                            break;
                    }
                    break;

                case 'fxparam':
                    if (!parts[1] || !parts[1].match(/^\d+$/)) {
                        break;

                    }

                    parts[1] = parseInt(parts[1]) - 1;
                    target.fxParams || (target.fxParams = []);
                    target.fxParams[parts[1]] || (target.fxParams[parts[1]] = {});

                    switch (parts[2]) {
                        case 'name':
                            target.fxParams[parts[1]].name = args[0];
                            break;

                        case 'value':
                            parts[3] = parts[3] === 'str' ? 'description' : 'value';
                            target.fxParams[parts[1]][parts[3]] = args[0];
                            break;
                    }
                    break;
            }
        },

        _dispatchUpdate: function () {
            _.deepExtend(this._.data, this._.incoming);

            _.each(this._.listeners, function (callback) {
                callback.call(null, this._.incoming);

            }.bind(this));

            this._.incoming = {};
            this._.pending = false;

        }
    });

})(_);