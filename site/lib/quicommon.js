//
// ButtonBase
//
ButtonBase = QuickUI.Control.extend({
	className: "ButtonBase"
});
$.extend(ButtonBase.prototype, {
	
	isFocused: QuickUI.Property.bool(null, false),
	isKeyPressed: QuickUI.Property.bool(null, false),
	isMouseButtonDown: QuickUI.Property.bool(null, false),
	isMouseOverControl: QuickUI.Property.bool(null, false),
	
	ready: function() {
		var self = this;
		$(this.element)
			.blur(function(event) { self.blur(event); })
			.click(function(event) {
				if (self.disabled())
				{
					event.stopImmediatePropagation();
				}
			})
			.focus(function(event) { self.focus(event); })
			.hover(
				function(event) { self.mousein(event); },
				function(event) { self.mouseout(event); }
			)
			.keydown (function(event) { self.keydown(event); })
			.keyup (function(event) { self.keyup(event); })
			.mousedown(function(event) { self.mousedown(event); })
			.mouseup(function(event) { self.mouseup(event); });
		this.renderButton();
	},
	
	blur: function(event) {
		
		$(this.element).removeClass("focused");

		// Losing focus causes the button to override any key that had been pressed.
		this.isKeyPressed(false);

		this.isFocused(false);
		this.renderButton();
	},
	
	// The current state of the button.
	buttonState: function() {
		if (this.disabled())
		{
			return ButtonBase.state.disabled;
		}
		else if ((this.isMouseButtonDown() && this.isMouseOverControl())
			|| this.isKeyPressed())
		{
			return ButtonBase.state.pressed;
		}
		else if (this.isFocused())
		{
			return ButtonBase.state.focused;
		}
		else if (this.isMouseOverControl() /* || this.isMouseButtonDown() */)
		{
			return ButtonBase.state.hovered;
		}

		return ButtonBase.state.normal;
	},

    disabled: QuickUI.Element().applyClass("disabled", function(disabled) {
		this.renderButton();
	}),
	
	focus: function(event) {
        if (!this.disabled()) 
        {
            $(this.element).addClass("focused");
            this.isFocused(true);
            this.renderButton();
        }
	},
	
	keydown: function(event) {
		if (!this.disabled() && (event.keyCode == 32 /* space */ || event.keyCode == 13 /* return */))
		{
			this.isKeyPressed(true);		
			this.renderButton();
		}
	},
	
	keyup: function(event) {
		this.isKeyPressed(false);
		this.renderButton();
	},
	
	mousedown: function(event) {
        if (!this.disabled())
        {
            $(this.element).addClass("pressed");
            this.isMouseButtonDown(true);
            this.renderButton();
        }
	},
	
	mousein: function(event) {
        if (!this.disabled()) 
        {
            $(this.element).addClass("hovered");
            this.isMouseOverControl(true);
            this.renderButton();
        }
	},
	
	mouseout: function(event) {
		$(this.element).removeClass("focused")
			.removeClass("hovered")
			.removeClass("pressed");
		this.isMouseOverControl(false);
		this.renderButton();
	},
	
	mouseup: function(event) {
		$(this.element).removeClass("pressed");
		this.isMouseButtonDown(false);
		this.renderButton();
	},
	
	renderButtonState: function(buttonState) {},
	
	renderButton: function() {
		this.renderButtonState(this.buttonState());
	}
});
$.extend(ButtonBase, {
	state: {
		normal: 0,
		hovered: 1,
		focused: 2,
		pressed: 3,
		disabled: 4
	}
});

//
// HorizontalPanels
//
HorizontalPanels = QuickUI.Control.extend({
	className: "HorizontalPanels",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.HorizontalPanels_left = $("<div id=\"HorizontalPanels_left\" class=\"minimumWidth\" />")[0],
				" ",
				this.HorizontalPanels_content = $("<div id=\"HorizontalPanels_content\" />")[0],
				" ",
				this.HorizontalPanels_right = $("<div id=\"HorizontalPanels_right\" class=\"minimumWidth\" />")[0],
				" "
			]
		});
	}
});
$.extend(HorizontalPanels.prototype, {
    content: QuickUI.Element("HorizontalPanels_content").content(),
    fill: QuickUI.Element().applyClass("fill"),
    left: QuickUI.Element("HorizontalPanels_left").content(),
    right: QuickUI.Element("HorizontalPanels_right").content(),
});

//
// IfBrowser
//
IfBrowser = QuickUI.Control.extend({
	className: "IfBrowser",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.IfBrowser_content = $("<span id=\"IfBrowser_content\" />")[0],
				" ",
				this.IfBrowser_elseContent = $("<span id=\"IfBrowser_elseContent\" />")[0],
				" "
			]
		});
	}
});
$.extend(IfBrowser.prototype, {
	browser: QuickUI.Property(),
	content: QuickUI.Element("IfBrowser_content").content(),
	elseContent: QuickUI.Element("IfBrowser_elseContent").content(),
	support: QuickUI.Property(),
	
	ready: function() {
		var usingSpecifiedBrowser = (this.browser() == undefined) || $.browser[this.browser()];
		var browserSupportsProperty = (this.support() == undefined) || $.support[this.support()];
		var allConditionsSatisfied = usingSpecifiedBrowser && browserSupportsProperty;
		$(this.IfBrowser_content).toggle(allConditionsSatisfied);
		$(this.IfBrowser_elseContent).toggle(!allConditionsSatisfied);
	}
});

//
// List
//
List = QuickUI.Control.extend({
	className: "List"
});
$.extend(List.prototype, {
    
    itemClass: QuickUI.Property(
        function() { this._refresh(); },
        null,
        function(className) {
            return eval(className);
        }
    ),
        
    items: QuickUI.Property(function() { this._refresh(); }),
    
    //
    // This mapFn should be a function that accepts one object
    // (typically a data object) and returns a new object whose
    // properties map directly to property settors defined by the
    // target itemClass.
    //
    mapFn: QuickUI.Property(),
    
    // Allows items and mapFn to both be set in one step.
    setItems: function(items, mapFn) {
        this.mapFn(mapFn);
        this.items(items);
    },
    
    _refresh: function() {
        var itemClass = this.itemClass();
        var items = this.items();
        var mapFn = this.mapFn();
        if (itemClass && items)
        {
            var me = this;
            var controls = $.map(items, function(item, index) {
                var properties;
                if (mapFn)
                {
                    // Map item to control properties with custom map function.
                    properties = mapFn.call(me, item, index);
                }
                else if (typeof item == "string" || item instanceof String)
                {
                    // Simple string; use as content property.
                    properties = { content: item };
                }
                else
                {
                    // Use the item as is for the control's properties.
                    properties = item;
                }
                var control = QuickUI.Control.create(itemClass, properties);
                return control;
            });
            $(this.element).items(controls);
        }
    }
    
});

//
// LoremIpsum
//
LoremIpsum = QuickUI.Control.extend({
	className: "LoremIpsum",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": " <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et adipiscing mi. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Mauris vestibulum orci sed justo lobortis viverra. Suspendisse blandit dolor nunc, nec facilisis metus. Ut vestibulum ornare eros id vestibulum. Phasellus aliquam pellentesque urna, eu ullamcorper odio sollicitudin vel. Aliquam lacinia dolor at elit viverra ullamcorper. Vestibulum ac quam augue. Fusce tortor risus, commodo in molestie vitae, rutrum eu metus. Nunc tellus justo, consequat in ultrices elementum, gravida a mi. Praesent in lorem erat, quis dictum magna. Aenean et eros ligula, quis sodales justo. Quisque egestas imperdiet dignissim.</p> <p>Aenean commodo nulla sit amet urna ornare quis dignissim libero tristique. Praesent non justo metus. Nam ut adipiscing enim. In hac habitasse platea dictumst. Nulla et enim sit amet leo laoreet lacinia ut molestie magna. Vestibulum bibendum venenatis eros sit amet eleifend. Fusce eget metus orci. Fusce tincidunt laoreet lacinia. Proin a arcu purus, nec semper quam. Mauris viverra vestibulum sagittis. Ut commodo, dolor malesuada aliquet lacinia, dui est congue massa, vel sagittis metus quam vel elit. Nulla vel condimentum odio. Aliquam cursus velit ut tellus ultrices rutrum.</p> <p>Vivamus sollicitudin rhoncus purus, luctus lobortis dui viverra vitae. Nam mauris elit, aliquet at congue sed, volutpat feugiat eros. Nulla quis nulla ac lectus dapibus viverra. Pellentesque commodo mauris vitae sapien molestie sit amet pharetra quam pretium. Maecenas scelerisque rhoncus risus, in pharetra dui euismod ac. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ut turpis sapien, sed molestie odio. Vivamus nec lectus nunc, vel ultricies felis. Mauris iaculis rhoncus dictum. Vivamus at mi tellus. Etiam nec dui eu risus placerat adipiscing non at nisl. Curabitur commodo nunc accumsan purus hendrerit mollis. Fusce lacinia urna nec eros consequat sed tempus mi rhoncus. Morbi eu tortor sit amet tortor elementum dapibus. Suspendisse tincidunt lorem quis urna sollicitudin lobortis. Nam eu ante ut tellus vulputate ultrices eu sed mi. Aliquam lobortis ultricies urna, in imperdiet lacus tempus a. Duis nec velit eros, ut volutpat neque. Sed quam purus, tempus vitae porta eget, porta sit amet eros.</p> <p>Vestibulum dignissim ullamcorper est id molestie. Nunc erat ante, lobortis id dictum in, ultrices sit amet nisl. Nunc blandit pellentesque sapien, quis egestas risus auctor quis. Fusce quam quam, ultrices quis convallis sed, pulvinar auctor tellus. Etiam dolor velit, hendrerit et auctor sit amet, ornare nec erat. Nam tellus mi, rutrum a pretium et, dignissim sed sapien. Sed accumsan dapibus ipsum ut facilisis. Curabitur vel diam massa, ut ultrices est. Sed nec nunc arcu. Nullam lobortis, enim nec gravida molestie, orci risus blandit orci, et suscipit nunc odio eget nisl. Praesent lectus tellus, gravida ut sagittis non, convallis a leo. Mauris tempus feugiat fermentum. Phasellus nibh mi, convallis eu pulvinar eget, posuere in nunc. Morbi volutpat laoreet mauris vel porta. Aenean vel venenatis nisi. Ut tristique mauris sed libero malesuada quis rhoncus augue convallis.</p> <p>Fusce pellentesque turpis arcu. Nunc bibendum, odio id faucibus malesuada, diam leo congue urna, sed sodales orci turpis id sem. Ut convallis fringilla dapibus. Ut quis orci magna. Mauris nec erat massa, vitae pellentesque tortor. Sed in ipsum nec enim feugiat aliquam et id arcu. Nunc ut massa sit amet nisl semper ultrices eu id lacus. Integer eleifend aliquam interdum. Cras a sapien sapien. Duis non orci lacus. Integer commodo pharetra nulla eget ultrices. Etiam congue, enim at vehicula posuere, urna lorem hendrerit erat, id condimentum quam lectus ac ipsum. Aliquam lorem purus, tempor ac mollis in, varius eget metus. Nam faucibus accumsan sapien vitae ultrices. Morbi justo velit, bibendum non porta vel, tristique quis odio. In id neque augue. Cras interdum felis sed dui ultricies laoreet sit amet eu elit. Vestibulum condimentum arcu in massa lobortis vitae blandit neque mattis. Nulla imperdiet luctus mollis.</p> <p>Donec eget lorem ipsum, eu posuere mi. Duis lorem est, iaculis sit amet molestie a, tincidunt rutrum magna. Integer facilisis suscipit tortor, id facilisis urna dictum et. Suspendisse potenti. Aenean et mollis arcu. Nullam at nulla risus, vitae fermentum nisl. Nunc faucibus porta volutpat. Sed pretium semper libero, vitae luctus erat lacinia vel. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer facilisis tempus tellus, rhoncus pretium orci semper sed. Morbi non lectus leo, quis semper diam. Suspendisse ac urna massa, vitae egestas metus. Pellentesque viverra mattis semper. Cras tristique bibendum leo, laoreet ultrices urna condimentum at. Praesent at tincidunt velit. Nam fringilla nibh quis nulla volutpat lacinia. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p> <p>Sed ultrices sollicitudin neque ut molestie. Sed at lectus in lacus scelerisque suscipit non id risus. Aliquam lorem nibh, convallis vitae molestie in, commodo feugiat nibh. Praesent bibendum arcu sit amet lacus posuere feugiat. Nullam nec lectus nisi. Aliquam porta, dui eu aliquam convallis, magna erat sodales ante, vitae dignissim velit quam in elit. Quisque vel lectus nunc. In dapibus bibendum fringilla. Praesent aliquet, leo sed lacinia euismod, mauris mauris fringilla arcu, in dignissim sem ligula in mauris. Integer tortor arcu, vulputate a hendrerit hendrerit, vulputate sit amet velit.</p> <p>Nulla non ipsum nec risus pharetra fermentum et vel tellus. Nullam a aliquam arcu. In consectetur accumsan consequat. In hac habitasse platea dictumst. Donec in eros mi, vel tristique odio. Nulla ut nulla dolor. Nam feugiat facilisis nibh et condimentum. Vivamus sapien nibh, fringilla at tempus at, ornare at risus. Nulla facilisi. Donec rhoncus est quis purus eleifend volutpat. Nulla luctus tortor vel arcu faucibus nec dapibus nulla luctus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Phasellus vel ligula a metus sollicitudin imperdiet. Suspendisse elit leo, imperdiet bibendum imperdiet sed, consectetur vitae neque. Proin sit amet mattis augue. Suspendisse potenti. Suspendisse velit mauris, bibendum vel laoreet at, euismod non orci. Duis venenatis, turpis nec ullamcorper tincidunt, nunc leo porta ante, in ornare urna dolor ultrices tellus. Donec sem metus, pharetra faucibus consectetur ac, dictum eget sapien. Cras non lectus at leo fringilla viverra.</p> <p>Integer convallis congue semper. Ut sit amet sem ut dui tempor rutrum vitae eu libero. Aenean id dui vel lectus scelerisque elementum a a sapien. Proin fringilla auctor nulla posuere fringilla. Fusce vel turpis quam, non tempus leo. Quisque ac bibendum nulla. Vivamus faucibus adipiscing tellus, ut sagittis urna laoreet vel. Suspendisse adipiscing laoreet sodales. Etiam nec ipsum sed magna posuere laoreet a eu magna. Donec nec vulputate mi. Nam magna sem, ultrices quis ullamcorper ac, placerat eu enim. Praesent sagittis, risus nec tempus tincidunt, elit est feugiat libero, non tincidunt lectus sapien a lacus. Donec odio lectus, mattis sed ultrices eget, consectetur tempus tortor.</p> <p>Nullam quam ipsum, ornare eu lacinia nec, scelerisque in mauris. Vestibulum rhoncus lobortis felis, tempor egestas enim gravida non. Duis nec nibh nunc. Maecenas interdum, quam sed dignissim vulputate, quam elit adipiscing nibh, mattis consectetur metus est ac nisi. Aenean rutrum viverra felis ut suscipit. Donec cursus, urna non ultricies ullamcorper, arcu leo sollicitudin tortor, sed congue orci libero eget dui. Nam pretium odio vitae enim tristique a accumsan purus consequat. Nulla ultricies consectetur enim a fringilla. Ut ut nisi elit, at condimentum ipsum. Nunc gravida scelerisque ante, nec vestibulum nulla euismod sit amet. Morbi mi est, varius nec rutrum eu, lacinia tempor tellus. Duis condimentum posuere eleifend. Sed fringilla massa a turpis consectetur ornare. Suspendisse molestie felis vitae turpis suscipit quis pharetra felis dictum. Praesent ipsum turpis, suscipit a porttitor eget, vulputate ut tellus. Duis sed consectetur arcu. In hac habitasse platea dictumst. Sed ipsum odio, rhoncus ut aliquam in, interdum et ante.</p> "
		});
	}
});
$.extend(LoremIpsum.prototype, {
    paragraphs: QuickUI.Property.integer(function(count) {
        $(this.element)
            .find("p")
            .css("display", "block")
            .filter(":gt(" + (count - 1) + ")")
            .css("display", "none");
    })
});

//
// Overlay
//
Overlay = QuickUI.Control.extend({
	className: "Overlay"
});
$.extend(Overlay.prototype, {

	blanket: QuickUI.Property(),
	dismissOnInsideClick: QuickUI.Property.bool(),
	dismissOnOutsideClick: QuickUI.Property.bool(null, true),
	
	ready: function()
	{
		var self = this;
		$(this.element).click(function() {
			if (self.dismissOnInsideClick())
			{
				self.hide();
			}
		});
	},
	
	createBlanket: function() {
		var newBlanket = $(this.element)
			.after("<div id='blanket'/>")
			.next()[0];
		var self = this;
		$(newBlanket)
			.click(function() {
				if (self.dismissOnOutsideClick())
				{
					self.hide();
				}
			})
			.css({
				cursor: "default",
				position: "fixed",
				opacity: 0.01,
				top: 0,
				left: 0,
				width: "100%",
				height: "100%"
			});
		return newBlanket;
	},
	
	hide: function()
	{
        /*
		$(this.element).remove();
        */
        $(this.element)
			.hide()
			.css("z-index", null); // No need to define Z-order any longer.
		if (this.blanket() != null)
		{
			// $(this.blanket()).remove();
			// this.blanket(null);
			$(this.blanket()).hide();
		}
	},
	
	/* Return the maximum Z-index in use by the page and its top-level controls. */
	maximumZIndex: function()
	{
		var topLevelElements = $("body").children().andSelf();
		var zIndices = $.map(topLevelElements, function(element) {
			switch ($(element).css("position")) {
				case "absolute":
				case "fixed":
					var zIndex = parseInt($(element).css("z-index")) || 1;
					return zIndex;
			}
		});
		return Math.max.apply(null, zIndices);
	},
	
	// Subclasses should override this to position themselves.
	position: function() {},
	
	show: function()
	{
		if (this.blanket() == null)
		{
			this.blanket(this.createBlanket());
		}
		
		if (!this.dismissOnOutsideClick())
		{
			$(this.blanket()).css({
				"background-color": "black",
				opacity: 0.25
			});
		}
		
		/* Show control and blanket at the top of the Z-order. */
		var maximumZIndex = this.maximumZIndex();
		$(this.blanket())
			.css("z-index", maximumZIndex + 1)
			.show();
		$(this.element)
			.css("z-index", maximumZIndex + 2)
			.show();
		this.position();
	}
});

//
// Page
//
Page = QuickUI.Control.extend({
	className: "Page"
});
/*
 * General page utility functions.
 */
$.extend(Page.prototype, {
	
	// If true, have the page fill its container.
	fill: QuickUI.Element().applyClass("fill"),

    urlParameters: function() {
        return Page.urlParameters();
    },
    	
	// Gets or sets the title of the page.
	title: function(value) {
		if (value !== undefined)
		{
			document.title = value;
		}
		return document.title;
	}

});

/*
 * Static members.
 */
$.extend(Page, {
    
    //
    // Return the URL parameters as a JavaScript object.
    // E.g., if the URL looks like http://www.example.com/index.html?foo=hello&bar=world
    // then this returns the object
    //
    //    { foo: "hello", bar: "world" }
    //
    urlParameters: function() {
        var regex = /[?&](\w+)=([^&#]*)/g;
        var results = {};
        var match = regex.exec( window.location.search );
        while (match != null)
        {
            var parameterName = match[1];
            var parameterValue = match[2];
            results[parameterName] = parameterValue;
            match = regex.exec( window.location.href );
        }
        return results;
    }    
    
});

/*
 * General utility functions made available to all controls.
 */
$.extend(QuickUI.Control.prototype, {
	
	/*
	 * Look up the page hosting a control.
	 */
	page: function() {
		// Get the containing DOM element subclassing Page that contains the element
		var pages = $(this.element).closest(".Page");
		
		// From the DOM element, get the associated QuickUI control.
		return (pages.length > 0) ? pages.control() : null;
	}
    
});

//
// Popup
//
Popup = Overlay.extend({
	className: "Popup",
	render: function() {
		Overlay.prototype.render.call(this);
		this.setClassProperties(Overlay, {
			"dismissOnInsideClick": "true"
		});
	}
});

//
// PopupButton
//
PopupButton = QuickUI.Control.extend({
	className: "PopupButton",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.PopupButton_content = $("<div id=\"PopupButton_content\" />")[0],
				" ",
				this.PopupButton_popup = QuickUI.Control.create(Popup, {
					"id": "PopupButton_popup"
				}),
				" "
			]
		});
	}
});
$.extend(PopupButton.prototype, {
	
	content: QuickUI.Element("PopupButton_content").content(),
	popup: QuickUI.Element("PopupButton_popup").content(),

	ready: function()
	{
		var self = this;
		$(this.PopupButton_content).click(function() {
			self.showPopup();
		});
		var popupControl = QuickUI(this.PopupButton_popup); 
		if (popupControl)
		{
			popupControl.position = function() {
				self.positionPopup();
			};
		}
	},
	
	showPopup: function()
	{
		$(this.PopupButton_popup).control().show();
	},
	
	positionPopup: function()
	{
		var $contentElement = $(this.PopupButton_content);
		var contentTop = $contentElement.offset().top;
		var contentHeight = $contentElement.outerHeight(true);
		var $popupElement = $(this.PopupButton_popup);
		var popupHeight = $popupElement.outerHeight(true);

		// Try showing popup below.
		var top = contentTop + contentHeight;
		if (top + popupHeight > $(document).height() &&
            contentTop - popupHeight >= 0)         
		{
            // Show popup above.
            top = contentTop - popupHeight;
		}
		$popupElement.css("top", top);
        
        var contentLeft = $contentElement.offset().left;
        var popupWidth = $popupElement.outerWidth(true);
        var left = $(document).width() - popupWidth;
        if (contentLeft + popupWidth > $(document).width() &&
            left > 0)
        {
            // Move popup left
            $popupElement.css("left", left);
        }
	}
	
});

//
// Repeater
//
Repeater = QuickUI.Control.extend({
	className: "Repeater",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.Repeater_expansion = $("<div id=\"Repeater_expansion\" />")[0],
				" "
			]
		});
	}
});
$.extend(Repeater.prototype, {

	ready: function() {
		this.expand();
	},
	
	content: QuickUI.Property(function() {
		this.expand();
	}),
	
	count: QuickUI.Property.integer(function(value) {
		this.expand();
	}, 0),
	
	expand: function() {
		var template = $(this.content());
		if (template != null)
		{
			$(this.Repeater_expansion).empty();
			var count = this.count();
			for (var i = 0; i < count; i++)
			{
				template.clone(true).appendTo(this.Repeater_expansion); // Deep copy
			}
		}
	},
	
	expansion: function() {
		return $(this.Repeater_expansion).html();
	}
	
});

//
// Sprite
//
Sprite = QuickUI.Control.extend({
	className: "Sprite"
});
$.extend(Sprite.prototype, {
	
	image: QuickUI.Element().css("background-image"),

	// The height of a single cell in the strip, in pixels.
	cellHeight: QuickUI.Property(function(value) {
		$(this.element).css("height", value + "px");
		this.shiftBackground();
	}),
	
	// The cell currently being shown.
	currentCell: QuickUI.Property(function(value) {
		this.shiftBackground();
	}, 0),
	
	shiftBackground: function() {
		if (this.currentCell() != null && this.cellHeight() != null) {
			var y = (this.currentCell() * -this.cellHeight()) + "px";
			if ($.browser.mozilla)
			{
				// Firefox 3.5.x doesn't support background-position-y,
				// use background-position instead.
				var backgroundPosition = $(this.element).css("background-position").split(" ");
				backgroundPosition[1] = y;
				$(this.element).css("background-position", backgroundPosition.join(" "));			
			}
			else
			{
				// Not Firefox
				$(this.element).css("background-position-y", y);
			}
		}
	}
});

//
// ToggleButtonBase
//
ToggleButtonBase = ButtonBase.extend({
	className: "ToggleButtonBase",
	render: function() {
		ButtonBase.prototype.render.call(this);
		this.setClassProperties(ButtonBase, {

		});
	}
});
$.extend(ToggleButtonBase.prototype, {
	
	selected: QuickUI.Element().applyClass("selected"),
	
	ready: function() {
		ToggleButtonBase.superProto.ready.call(this);
		var me = this;
		$(this.element).click(function() {
            if (!me.disabled())
            {
                me.toggle();
            }
		});
	},
	
	toggle: function() {
		this.selected(!this.selected());
	}
});

//
// VerticalAlign
//
VerticalAlign = QuickUI.Control.extend({
	className: "VerticalAlign"
});

//
// VerticalPanels
//
VerticalPanels = QuickUI.Control.extend({
	className: "VerticalPanels",
	render: function() {
		QuickUI.Control.prototype.render.call(this);
		this.setClassProperties(QuickUI.Control, {
			"content": [
				" ",
				this.rowTop = $("<div id=\"rowTop\" class=\"minimumHeight\" />").items(
					" ",
					this.VerticalPanels_top = $("<div id=\"VerticalPanels_top\" />")[0],
					" "
				)[0],
				" ",
				this.VerticalPanels_content = $("<div id=\"VerticalPanels_content\" />")[0],
				" ",
				this.rowBottom = $("<div id=\"rowBottom\" class=\"minimumHeight\" />").items(
					" ",
					this.VerticalPanels_bottom = $("<div id=\"VerticalPanels_bottom\" />")[0],
					" "
				)[0],
				" "
			]
		});
	}
});
$.extend(VerticalPanels.prototype, {
    bottom: QuickUI.Element("VerticalPanels_bottom").content(),
    content: QuickUI.Element("VerticalPanels_content").content(),
    fill: QuickUI.Element().applyClass("fill"),
    top: QuickUI.Element("VerticalPanels_top").content()
});

//
// Dialog
//
Dialog = Overlay.extend({
	className: "Dialog",
	render: function() {
		Overlay.prototype.render.call(this);
		this.setClassProperties(Overlay, {
			"dismissOnOutsideClick": "false"
		});
	}
});
$.extend(Dialog, {
	show: function(dialogClass, properties, callbackOk, callbackCancel) {
		var dialog = $("body")
			.append("<div/>")
			.find(":last")
			.control(dialogClass)
			.control();
        $(dialog.element).bind({
            ok: function() {
                if (callbackOk)
                {
                    callbackOk.call(this);
                }
            },
            cancel: function() {
                if (callbackCancel)
                {
                    callbackCancel.call(this);
                }
            }
        });
		dialog.setProperties(properties);
		dialog.show();
	}
});

$.extend(Dialog.prototype, {
	
	ready: function() {
		Dialog.superProto.ready.call(this);
		var self = this;
		$(this.element).keydown(function(event) {
			if (event.keyCode == 27)
			{
				self.cancel();
			}
		});
	},

	cancel: function() {
		this.hide();
		$(this.element).trigger("cancel");
	},
	
	close: function() {
		this.hide();
		$(this.element).trigger("ok");
	},
	
	position: function() {
		// Center dialog horizontally and vertically.
		var left = ($(window).width() - $(this.element).outerWidth()) / 2;
		var top = ($(window).height() - $(this.element).outerHeight()) / 2;
		$(this.element).css({
			left: left,
			top: top
		});
	}
});

