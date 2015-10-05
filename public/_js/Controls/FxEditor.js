(function($, _) {
    "use strict";

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {});

    var FxEditor = Controls.FxEditor = function(app, options) {
        this._ = {
            app: app,
            options: _.defaults(options || {}, FxEditor.defaults),
            elms: {
                holder: $('<div></div>'),
                header: $('<div></div>'),
                editor: $('<div></div>'),
                title: $('<div></div>'),
                btnBankLeft: $('<button></button>'),
                btnBankRight: $('<button></button>'),
                btnActive: $('<button></button>'),
                btnQuit: $('<button></button>')
            },
            editors: [],
            layers: [],
            active: -1,
            index: null,
            bypassed: null
        };

        this._.elms.holder.addClass('fxeditor');
        this._.elms.header.addClass('fxeditor-header');
        this._.elms.editor.addClass('fxeditor-editor layer-root');
        this._.elms.btnActive.addClass('fxeditor-btnActive');
        this._.elms.title.addClass('fxeditor-title');
        this._.elms.btnBankLeft.addClass('fxeditor-btnBank fxeditor-btnBankLeft btnPrev');
        this._.elms.btnBankRight.addClass('fxeditor-btnBank fxeditor-btnBankRight btnNext');
        this._.elms.btnQuit.addClass('fxeditor-btnQuit btnClose');

        this._.elms.holder.append(
            this._.elms.header,
            this._.elms.editor
        );

        this._.elms.header.append(
            this._.elms.btnActive,
            this._.elms.title,
            this._.elms.btnBankLeft,
            this._.elms.btnBankRight,
            this._.elms.btnQuit
        );

        this._.elms.header.on('touchstart touchend', '.fxeditor-btnBank', this._handleBank.bind(this));
        this._.elms.btnActive.on('touchstart touchend', this._handleToggle.bind(this));
        this._.elms.btnQuit.on('touchstart touchend', this._handleQuit.bind(this));

        this._createEditors();

    };

    FxEditor.defaults = {
        editors: [
            'EQ',
            'LA',
            'Comp',
            'Generic'
        ]
    };

    _.extend(FxEditor.prototype, {
        attach: function (container) {
            this._.elms.holder.appendTo(container);

            _.each(this._.layers, function (layer) {
                layer.attach(this._.elms.editor);

            }.bind(this));

            return this;

        },

        update: function (params) {
            if (this._.active !== -1) {
                this._.editors[this._.active].update(params);

            }
        },

        reposition: function () {
            _.each(this._.editors, function (ed) {
                ed.reposition();

            });
        },

        setActive: function (info) {
            this._.index = info.fx.index;
            this._toggleButton(info.fx.bypassed);

            this._.elms.title.empty();
            this._.elms.title.append(
                $('<span class="fxeditor-title-fx"></span>').text(info.fx.name),
                $('<span class="fxeditor-title-label"></span>').text('on track'),
                $('<span class="fxeditor-title-channel"></span>').text(info.channel.name)
            );

            if (this._.active !== -1) {
                this._.layers[this._.active].setActive(false);

            }

            this._.active = _.findIndex(this._.editors, function (ed) {
                return ed.supportsPlugin(info.fx.name);

            });

            if (this._.active !== -1) {
                this._.editors[this._.active].setPlugin(info.fx.name);
                this._.layers[this._.active].setActive(true);

                if (this._.editors[this._.active].supportsBanks()) {
                    this._.elms.btnBankLeft.css('display', '');
                    this._.elms.btnBankRight.css('display', '');

                } else {
                    this._.elms.btnBankLeft.css('display', 'none');
                    this._.elms.btnBankRight.css('display', 'none');

                }

                this._.app.sendMessage('/device/fxparam/count', [this._.editors[this._.active].getBankSize()]);

            }

            this._.app.selectFx(info.channel.index, info.fx.index);

            return this;

        },

        _createEditors: function () {
            var onChange = this._handleChange.bind(this);

            _.each(this._.options.editors, function (name) {
                if (typeof Contrall.Editors[name] === 'undefined') {
                    throw new Error('Unknown editor: ' + name);

                }

                var editor = new Contrall.Editors[name](this._.app, {
                        onChange: onChange
                    }),
                    layer = new Controls.Layer(editor);

                this._.editors.push(editor);
                this._.layers.push(layer);

            }.bind(this));
        },

        _toggleButton: function (value) {
            if (this._.bypassed !== value) {
                if (value) {
                    this._.elms.btnActive.removeClass('active');

                } else {
                    this._.elms.btnActive.addClass('active');

                }
            }

            this._.bypassed = value;

        },

        _handleChange: function (param, address, value) {
            address = '/fxparam/' + (param + 1) + address;
            typeof value === 'boolean' && (value = value ? 1 : 0);
            this._.app.sendMessage(address, [value]);

        },

        _handleBank: function (evt) {
            evt.preventDefault();

            if (evt.type !== 'touchstart') {
                return;

            }

            var dir = evt.currentTarget.classList.contains('fxeditor-btnBankLeft') ? '-' : '+';
            this._.app.sendMessage('/device/fxparam/bank/' + dir, [1]);

        },

        _handleQuit: function (evt) {
            evt.preventDefault();

            if (evt.type !== 'touchstart') {
                return;

            }

            this._.app.setActive('mixer');

        },

        _handleToggle: function (evt) {
            evt.preventDefault();

            if (evt.type !== 'touchstart') {
                return;

            }

            this._toggleButton(!this._.bypassed);
            this._.app.sendMessage('/fx/bypass', [this._.bypassed ? 0 : 1]);

        }
    });


})(jQuery, _);