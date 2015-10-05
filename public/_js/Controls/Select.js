(function ($, $d, _) {
    "use strict";

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {});

    var Select = Controls.Select = function (options) {
        this._ = {
            options: _.defaults(options || {}, Select.defaults),
            elms: {
                holder: $('<div></div>'),
                label: $('<span></span>'),
                value: $('<span></span>'),
                list: $('<div></div>')
            },
            items: [],
            name: null,
            value: null,
            current: null,
            open: false,
            openTime: 0,
            listHeight: null,
            valueHeight: null,
            updLock: false
        };

        this._.elms.holder.addClass('select');
        this._.elms.label.addClass('select-label');
        this._.elms.value.addClass('select-value');
        this._.elms.list.addClass('select-list');

        if (this._.options.className) {
            this._.elms.holder.addClass(this._.options.className);
            this._.elms.list.addClass(this._.options.className);

        }

        this._.elms.holder.append(
            this._.elms.label,
            this._.elms.value
        );

        this._prepareItems();
        this._.elms.holder.on('touchstart touchend', this._handleTouch.bind(this));
        this._.elms.list.on('touchstart touchend', '.select-item', this._handleItem.bind(this));
        this._reposition = this._reposition.bind(this);
        this._handleClose = this._handleClose.bind(this);

    };

    Select.defaults = {
        onChange: _.noop,
        onTouch: _.noop,
        className: null,
        items: []
    };

    _.extend(Select.prototype, {
        attach: function (container) {
            this._.elms.holder.appendTo(container);
            return this;

        },

        remove: function () {
            this._.elms.holder.remove();

        },

        reposition: function () {
            if (this._.open && !this._.updLock) {
                this._.updLock = true;
                window.requestAnimationFrame(this._reposition);

            }
        },

        setValue: function (value) {
            if (this._.value !== value) {
                this._.value = value;
                this._setCurrent(this._findCurrent(value));

            }

            return this;

        },

        getValue: function () {
            return this._.value;

        },

        setDescription: function (description) {
            // noop
            return this;

        },

        setName: function (name) {
            if (this._.name !== name) {
                this._.name = name;
                this._.elms.label.text(this._.name);

            }

            return this;

        },

        setItems: function (items) {
            this._.options.items = items;
            this._.elms.list.empty();
            this._.elms.value.empty();
            this._.current = null;
            this._prepareItems();
            return this;

        },

        _setCurrent: function(index) {
            if (this._.current !== null) {
                this._.items[this._.current].removeClass('current');

            }

            this._.current = index;
            this._.items[this._.current].addClass('current');
            this._.elms.value.text(this._.options.items[this._.current].label);

        },

        _findCurrent: function (value) {
            return _.findIndex(this._.options.items, function (options) {
                return options.is(value);

            });
        },

        _handleTouch: function (evt) {
            evt.preventDefault();

            if (evt.type === 'touchstart') {
                if (this._.open) {
                    this._close();

                } else {
                    this._open();

                }
            } else if (this._.open && this._.openTime + 350 < Date.now()) {
                var touch = _.find(evt.originalEvent.changedTouches, function(t) { return this._.elms.holder.is(t.target) || $.contains(this._.elms.holder[0], t.target); }, this),
                    elm, index;

                if (!touch) {
                    return;

                }

                elm = document.elementFromPoint(touch.pageX, touch.pageY);

                if (elm) {
                    elm = _.find(this._.items, function(item) { return item.is(elm); });

                    if (elm) {
                        index = elm.data('index');
                        this._itemSelected(index);

                    }
                }
            }
        },

        _handleItem: function (evt) {
            evt.preventDefault();

            if (evt.type === 'touchstart') {
                var item = $(evt.currentTarget),
                    index = item.data('index');

                this._itemSelected(index);

            }
        },

        _itemSelected: function (index) {
            this._setCurrent(index);
            this._.value = this._.options.items[index].value;
            this._.options.onChange(this._.value);
            this._close();

        },

        _open: function () {
            if (this._.open) {
                return;

            }

            this._updateSizes();
            this._updateListPosition();
            this._.elms.list.appendTo('body');
            $d.on('touchstart', this._handleClose);
            this._.open = true;
            this._.openTime = Date.now();

        },

        _close: function () {
            if (!this._.open) {
                return;

            }

            this._.elms.list.detach();
            $d.off('touchstart', this._handleClose);
            this._.open = false;

        },

        _handleClose: function (evt) {
            if (!this._.elms.holder.is(evt.target) && !$.contains(this._.elms.holder[0], evt.target) && !this._.elms.list.is(evt.target) && !$.contains(this._.elms.list[0], evt.target)) {
                this._close();

            }
        },

        _reposition: function () {
            this._updateListPosition();
            this._.updLock = false;

        },

        _updateListPosition: function () {
            var ofs = this._.elms.value.offset(),
                scroll = window.pageYOffset,
                wh = window.innerHeight;

            if (ofs.top + this._.listHeight < wh + scroll) {
                this._.elms.list.css({
                    left: ofs.left,
                    top: ofs.top
                });
            } else {
                this._.elms.list.css({
                    left: ofs.left,
                    top: ofs.top + this._.valueHeight - this._.listHeight
                });
            }
        },

        _prepareItems: function () {
            _.each(this._.options.items, function (options, index) {
                this._.items.push(this._createItem(options, index));

            }.bind(this));

            if (this._.items.length) {
                this._updateSizes();

            }
        },

        _updateSizes: function () {
            this._.elms.list.css({
                left: -1000,
                top: -1000,
                opacity: 0
            }).appendTo('body');

            this._.listHeight = this._.elms.list.height();

            this._.elms.value.css({
                width: this._.items[0].width()
            });

            this._.valueHeight = this._.elms.value.outerHeight();

            this._.elms.list.detach().css({
                opacity: ''
            });
        },

        _createItem: function (options, index) {
            var item = $('<span></span>');

            item.addClass('select-item');
            item.text(options.label);
            item.data('index', index);
            this._.elms.list.append(item);

            return item;

        }
    });

})(jQuery, jQuery(document), _);