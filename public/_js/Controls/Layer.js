(function($, _) {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Controls = Contrall.Controls || (Contrall.Controls = {});


    var Layer = Controls.Layer = function (control) {
        this._ = {
            elms: {
                holder: $('<div></div>')
            },
            active: false,
            control: control
        };

        this._.elms.holder.addClass('layer');

    };


    _.extend(Layer.prototype, {
        attach: function (container) {
            this._.elms.holder.appendTo(container);
            this._.control.attach(this._.elms.holder);

        },

        setActive: function (value) {
            if (this._.active === value) {
                return;

            }

            this._.active = value;

            if (this._.active) {
                this._.elms.holder.addClass('layer-active');

            } else {
                this._.elms.holder.removeClass('layer-active');

            }

            return this;

        }
    });

})(jQuery, _);