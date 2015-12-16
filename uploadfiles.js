// created by ducanhkb

if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {};
		F.prototype = obj;
		return new F();
	};
}

(function( $, window, document, undefined ) {
	var UploadFile = {
			init: function( options, elem ) {
				var self = this;
				self.elem = elem;
				self.$elem = $( elem );
				self.options = $.extend( {}, $.fn.uploadfile.options, options );
				self.files = [];
				var html = '<div class="alertImage alert-success hide">';
				html += '<strong><span class="title"></span></strong><div class="message"></div>';
				html += '</div>';
				html += '<input type="file" class="file" ' + (self.options.multiple?'multiple':'') +'/>';
				html += '<div class="row">';
				html += '<div class="drop-messages">'+self.options.defaultText+'</div>';
				html += '<div class="text-center lstImage" limits="'+ self.options.limits +'"></div>';
				html += '</div>';
				self.$elem.append(html);
				self.upload(self.files);
				self.checkEmpty();
			 	self.$elem.find('.file').on('change',function(){
			      	var arrImg = $(this)[0].files;
			     	if(arrImg.length>0)
			      	{
			        	self.upload(arrImg);
			      	}
			    });

			    self.$elem.on('drop', function(event) {
			      	var arrImg = event.originalEvent.dataTransfer.files;
			      	self.upload(arrImg);
			      	return false;
			    }).on('dragleave', function(event) {
			        self.$elem.toggleClass("dragging");
		          	return false;
			    }).on('dragover', function(event) {
		          	return false;
			    }).on('dragenter', function(event) {
			        self.$elem.toggleClass("dragging");
		          	return false;
			    });
			},
			setFiles: function(files) {
				var self = this;
				self.clear();
				self.upload(files);
			},
			getFiles: function() {
				var self = this;
				return self.files;
			},
			showMessage: function(blnError,title,message) {
				var self = this;
				if(blnError)
			    {
			        self.$elem.children('.alertImage').removeClass('hide').removeClass('alert-success').addClass('alert-danger');
			    }
			    else
			    {
			        self.$elem.children('.alertImage').removeClass('hide').removeClass('alert-danger').addClass('alert-success');
			    }
			    self.$elem.find('.message').html(message);
			    self.$elem.find('.title').html(title);
			},
			hideMessage: function() {
				var self = this;
				self.$elem.children('.alertImage').addClass('hide');
				self.$elem.find('.message').html('');
			    self.$elem.find('.title').html('');
			},
			checkEmpty: function(){
				var self = this;
				if(self.$elem.find('.lstImage').children('div').length>0 || (self.options.multiple?(self.$elem.children('.file')[0].files.length>0):self.$elem.children('.file').val()!=''))
			  	{
		    		self.$elem.find(".drop-messages").addClass('hide');
			  	}
			  	else
			  	{
			    	self.$elem.find(".drop-messages").removeClass('hide');
			  	}
			},
			delete: function() {
				var self = this;
				setTimeout(function() {
					self.$elem.find('.iconDeleteImage').unbind();
					self.$elem.find('.iconDeleteImage').each(function(index){
						$(this).bind('click',function(e){
							e.preventDefault();
							$(this).parent().remove();
							var temp = self.files;
							temp.splice(index,1);
							self.files = temp;
							if(!self.options.multiple)
							{
								self.files = [];
								self.$elem.children('.file').val('');
							}
							self.checkEmpty();
							self.delete();
						});
					})
				},1);
			},
			clear: function() {
				var self = this;
				self.$elem.children('.alertImage').addClass('hide');
				self.$elem.find('.message').html('');
			    self.$elem.find('.title').html('');
			    self.$elem.children('.file').val('');
			    self.$elem.find('.lstImage').html('');
			    self.files = [];
			},
			refresh: function() {
				var self = this;
				self.clear();
				self.checkEmpty();
			},
			validator: function() {
				var self = this;
				if(self.options.required && self.$elem.find('.lstImage').children('div').length<=0)
				{
					self.showMessage(true,'',self.options.message_empty);
					return false;
				}
				return true;
			},
			upload: function(files) {
				var self = this;
				self.hideMessage();
				if(!self.options.multiple)
				{
					self.$elem.find(".lstImage").html('');
				}
				if(files.length>0 && (typeof files[0] == "string"))
				{
					var html = '';
					var temp = [];
					for(i=0;i<files.length;i++)
					{
						html = '<div class="col-sm-12 text-center" style="padding:10px;position: relative;margin-top:5px; height:180px;">';
						html += '<img  style="max-width:100%; max-height:160px;" src="'+ files[i] +'" />';
						html += '<span class="view iconDeleteImage fa fa-times"></span>';
						html += '</div>';
						self.$elem.find(".lstImage").append(html);
						temp = self.files;
						temp.push(files[i]);
					}
					self.files = temp;
				}
				else
				{
					if(self.options.multiple)
					{
						for(var i=0;i<files.length;i++)
						{
							var arrExtension = self.options.extends;
							var extension = files[i].name.substr(files[i].name.lastIndexOf('.')).toLowerCase();
							if(arrExtension.indexOf(extension)<0)
							{
							  self.showMessage(true,'',self.options.message_format.replace('{0}',arrExtension.join(', ')));
							  return false;
							}
						}
						if((self.files.length + files.length) > self.options.limits || self.$elem.find(".lstImage").children("div").length >= self.options.limits)
						{
							self.showMessage(true,'',self.options.message_limit.replace('{0}',self.options.limits));
							return false;
						}
					}
					var html = '';
					var temp = [];
					for(i=0;i<files.length;i++)
					{
						var reader = new FileReader();
						reader.onload = function (e) {
						    html = '<div class="col-lg-10 col-lg-offset-1 image_upload" style="padding:10px;position: relative;margin-top:5px; height:180px;">';
						    html += '<img  style="max-width:100%; max-height:160px;" src="'+ e.target.result +'" />';
						    html += '<span class="view iconDeleteImage fa fa-times"></span>';
						    html += '</div>';
						    self.$elem.find(".lstImage").append(html);
						}
						reader.readAsDataURL(files[i]);
						temp = self.files;
						temp.push(files[i]);
					}
					self.files = temp;
				}
				self.delete();
				self.checkEmpty();
			},
			uploadAjax: function(url,callback) {

			},
			deleteAjax: function(url,callback) {

			},
			doneCallback: function(){
				var self = this;
			}
	};

	$.fn.uploadfile = function( options ) {
		return this.each(function() {
			var elevate = Object.create( UploadFile );
			elevate.init( options, this );
			$.data( this, 'uploadfile', elevate );
		});
	};

	$.fn.uploadfile.options = {
		limits: 1,
		extends: [".jpg", ".jpeg", ".bmp", ".gif", ".png"],
		multiple: true,
		required: false,
		message_empty: "Hình ảnh bắt buộc phải có.",
		defaultText: "Kéo thả hình ảnh hoặc click vào đây.",
		message_limit: "Bạn chỉ được phép đăng tải {0} ảnh duy nhất.",
		message_format: "Định dạng tệp tin không hợp lệ. Hệ thống cho phép đăng tải các file có định dạng {0}.",
		files: []
	};

})( jQuery, window, document );
