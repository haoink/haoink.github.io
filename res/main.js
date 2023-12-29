	import PhotoSwipeLightbox from './photoswipe/photoswipe-lightbox.esm.js';
	import PhotoSwipe from './photoswipe/photoswipe.esm.js';
	// Re-enabling transitions after page load
	window.addEventListener('load', function() {
		document.body.classList.remove('stop-transitions');
	});
	const IS_LOCAL = location.protocol === 'file' || location.host.startsWith('127.0.0.1') || location.host.startsWith('192.168'),
		// Modal handling
		removeModals = function() {
			const modals = lightbox.pswp.element.querySelectorAll('.modal');
			if (modals) {
				Array.prototype.forEach.call(modals, function(modal) {
					modal.parentNode.removeChild(modal);
				});
				lightbox.pswp.element.classList.remove('has-modal');
			}
		},
		closeModals = function(except) {
			const modals = lightbox.pswp.element.querySelectorAll('.modal' + ((typeof except !== 'undefined')? (':not(.' + except + ')') : ''));
			if (modals) {
				Array.prototype.forEach.call(modals, modal => { modal.style.display = 'none'; });
			}
		},
		createModal = function(el, className) {
			removeModals();
			const window = document.createElement('div'),
				br = el.getBoundingClientRect();
			window.classList.add(className, 'modal');
			window.style.right = (window.innerWidth || document.documentElement.clientWidth) - br.right + 'px';
			window.style.top = br.bottom + 'px';
			lightbox.pswp.element.appendChild(window);
			lightbox.pswp.element.classList.add('has-modal');
			return window;
		},
		getModal = function(className) {
			return lightbox.pswp.element.querySelector('.modal.' + className);
		},
		closeModal = function(el) {
			if (typeof el === 'string') el = getModal(el);
			el.style.display = 'none';
			lightbox.pswp.element.classList.remove('has-modal');
		},
		openModal = function(el) {
			if (typeof el === 'string') el = getModal(el);
			closeModals();
			el.style.display = 'block';
			lightbox.pswp.element.classList.add('has-modal');
		},
		toggleModal = function(el) {
			if (typeof el === 'string') el = getModal(el);
			if (el.style.display === 'block') {
				closeModal(el);
			} else {
				openModal(el);
			}
		},
		// Media handling
		pauseAllMedia = function() {
			let media = lightbox.pswp.element.querySelectorAll('video,audio');
			if (media) {
				Array.prototype.forEach.call(media, function(m) {
					m.pause();
				});
			}
		},
		// Prev/Next arrow
		leftArrowSVGString = '<svg aria-hidden="true" class="pswp__icn" width="60" height="60" viewBox="0 0 60 60"><path fill="#222222" fill-rule="evenodd" d="m17.23 30 21-21 1.54 1.54L20.3 30l19.47 19.46L38.23 51Z"/></svg>',
		// Initing lightbox
		lightbox = new PhotoSwipeLightbox({
			gallery: 				'.main',
			children: 				'.card.image > .thumb,.card.video > .thumb,.aday > .thumb',
			mouseMovePan: 			true,
			initialZoomLevel: 		'fit',
			secondaryZoomLevel: 	1,
			maxZoomLevel: 			4,
			bgOpacity: 				0.980,
			counter: 				false,
			arrowPrevSVG:			leftArrowSVGString,
			arrowNextSVG:			leftArrowSVGString,
			closeSVG:				'<svg aria-hidden="true" class="pswp__icn" width="32" height="32" viewBox="0 0 32 32"><path fill="#222222" d="M26.11 4.83 16 14.94 5.89 4.83 4.83 5.89 14.94 16 4.83 26.11l1.06 1.07L16 17.06l10.11 10.12 1.07-1.07L17.06 16 27.18 5.89l-1.07-1.06z"/></svg>',
			zoomSVG:				'<svg aria-hidden="true" class="pswp__icn" width="32" height="32" viewBox="0 0 32 32"><path fill="#222222" d="m27.75 26.69-5.35-5.35a9.76 9.76 0 1 0-1.06 1.06l5.35 5.35ZM15 23.25A8.25 8.25 0 1 1 23.25 15 8.25 8.25 0 0 1 15 23.25Z"/><path fill="#222222" d="M9.75 14.25h10.5v1.5H9.75z" class="pswp__zoom-icn-bar-h"/><path fill="#222222" d="M14.25 9.75h1.5v10.5h-1.5z" class="pswp__zoom-icn-bar-v"/></svg>',
			closeTitle: 			'Close',
			zoomTitle: 				'Zoom',
			arrowPrevTitle: 		'Previous',
			arrowNextTitle: 		'Next',
			pswpModule: 			PhotoSwipe
		});
	
	// Mouse wheel handler
	lightbox.on('bindEvents', () => {
		lightbox.pswp.container.addEventListener('wheel', (e) => {
			e.preventDefault();
			if (e.wheelDelta > 0) {
				lightbox.pswp.prev();
			} else if (lightbox.pswp.currIndex < lightbox.getNumItems() - 1) {
				lightbox.pswp.next();
			}
		});
	});
	let swiped = false,
		swipedTo,
		setSwiped = function(on) {
			clearTimeout(swipedTo);
			swiped = on;
			if (on) {
				swipedTo = setTimeout(function() {
					swiped = false;
				}, 500);
			}
		};
	lightbox.on('pointerUp', (e) => {
		setSwiped(!e.originalEvent.target.classList.contains('pswp__button'));
	});
	lightbox.on('pointerDown', (e) => {
		if (lightbox.pswp.element.classList.contains('has-modal')) {
			e.preventDefault();
			if (!e.originalEvent.target.closest('.modal') && !e.originalEvent.target.getAttribute('rel')) {
				closeModals();
				lightbox.pswp.element.classList.remove('has-modal');
			}
		}
	});
	lightbox.on('contentActivate', ({ content }) => {
		if (!swiped) { 
			content.element.classList.add('fadein');
			setTimeout(function() { content.element.classList.remove('fadein'); }, 550)
		}
	});
	
	// Counter
	lightbox.on('uiRegister', function() {
		lightbox.pswp.ui.registerElement({
			name: 				'custom-counter',
			order: 				7,
			isButton: 			false,
			appendTo: 			'bar',
			onInit: 			(el, pswp) => {
									pswp.on('change', () => {
										const index = lightbox.pswp.currIndex + 1,
											max = lightbox.getNumItems();
										el.innerHTML = (index < max)? (index + '<span>' + (max - 1) + '</span>') : '';
									});
								}
		});
	});
	
	// Audio player
	lightbox.on('uiRegister', function() {
		lightbox.pswp.ui.registerElement({
			name: 				'audio-player',
			order: 				8,
			isButton: 			false,
			appendTo: 			'bar',
			onInit: 			(el, pswp) => {
									pswp.on('change', () => {
										const currSlideElement = lightbox.pswp.currSlide.data.element;
										if (currSlideElement) {
											const clip = currSlideElement.getAttribute('data-audioclip');
											if (clip) {
												el.classList.remove('hidden');
												el.innerHTML = '<audio controls controlslist="play notimeline nofullscreen nodownload noplaybackrate"><source src="' + clip + '" type="audio/mpeg"></audio>';
												return;
											}
										}
										el.innerHTML = '';
									});
								}
		});
	});
	
	// Displaying captions
	lightbox.on('uiRegister', function() {
		lightbox.pswp.ui.registerElement({
			name: 				'custom-caption',
			order: 				9,
			isButton: 			false,
			appendTo: 			'root',
			onInit: 			(el, pswp) => {
									pswp.on('change', () => {
										const currSlideElement = lightbox.pswp.currSlide.data.element;
										if (currSlideElement) {
											const caption = currSlideElement.getAttribute('data-caption');
											if (caption) {
												el.classList.remove('hidden');
												el.innerHTML = caption;
												return;
											}
										}
										el.classList.add('hidden');
									});
								}
		});
	});
	
	// Video support
	lightbox.addFilter('itemData', (itemData, index) => {
		if (index === lightbox.getNumItems() - 1) {
			return;
		}
		let d = itemData.element.dataset.pswpVideoSrc;
		if (d) {
			itemData.videoSrc = d;
		}
		d = itemData.element.dataset.pswpVideoPoster;
		if (d) {
			itemData.videoPoster = d;
		}
		return itemData;
	});
	// use <video> instead of <img>
	lightbox.on('contentLoad', (e) => {
		const { content, isLazy } = e;
	
		if (content.data.videoSrc) {
			// stopping the default behavior
			e.preventDefault();
			content.element = document.createElement('div');		  
			content.element.className = 'pswp__video';
			content.state = 'loading';
			content.videoElement = document.createElement('video');
			content.videoElement.src = content.data.videoSrc;
			content.videoElement.controls = true;
			if (content.data.videoPoster) {
				content.videoElement.poster = content.data.videoPoster;
			}
			content.element.appendChild(content.videoElement);
			content.videoElement.oncanplaythrough = () => {
				content.onLoaded();
			};
			
			content.element.onerror = () => {
				content.onError();
			};
		}
	});
	// on append: append the <video> element
	lightbox.on('contentAppend', (e) => {
		const { content } = e;
		if (content.data.videoSrc && content.element && !content.element.parentNode) {
			e.preventDefault();
			content.slide.container.appendChild(content.element);
		}
	});
	// on remove: remove the <video> element
	lightbox.on('contentRemove', (e) => {
		const { content } = e;
		if (content.data.videoSrc && content.element && content.element.parentNode) {
			e.preventDefault();
			content.element.remove();
		}
	});
		
	
	// Last page handling
	lightbox.addFilter('numItems', (numItems) => {
		return ++numItems;
	});
	lightbox.addFilter('itemData', (itemData, index) => {
		if (index === lightbox.getNumItems() - 1) {
			const ni = document.body.getAttribute('data-next-index');
			return {
				html: '<div class="last-slide">' +
					(ni? '<h4>Where to go next?</h4>' : '') +
					'<div class="buttons">' +
						'<a class="quit btn">Back to index page</a>' +
						(ni? '<a href="' + ni + '" class="next-index btn">Next folder</a>' : '') +
					'</div></div>'
			};
		}
		return itemData;
	});
	lightbox.on('contentActivate', ({ content }) => {
		if (content.type === 'html') {
			const btn = content.element.querySelector('.quit');
			if (btn) {
				btn.onclick = function(e) {
					e.preventDefault();
					lightbox.pswp.close();
				};
			}
			lightbox.pswp.element.classList.add('after-last');
		} else {
			lightbox.pswp.element.classList.remove('after-last');
		}
	});
	
	
	
	
	// Download button
	lightbox.on('uiRegister', function() {
		lightbox.pswp.ui.registerElement({
			name: 		'download-button',
			ariaLabel: 	'Download image',
			title:		'Download image',
			order: 		7,
			isButton: 	true,
			tagName: 	'a',
			html: 		'<svg aria-hidden="true" class="pswp__icn" width="32" height="32" viewBox="0 0 32 32"><path fill="#222222" d="M25.5 21v4.5h-19V21H5v6h22v-6ZM21.48 12.44l-4.73 4.74V6h-1.5v11.18l-4.73-4.74-1.07 1.06L16 20.05l6.55-6.55-1.07-1.06z"/></svg>',
			onInit: 	(el, pswp) => {
							el.setAttribute('download', '');
							el.setAttribute('rel', 'noopener');
							pswp.on('change', () => {
								const currSlideElement = lightbox.pswp.currSlide.data.element;
								if (currSlideElement) {
									const link = currSlideElement.getAttribute('data-download');
									if (link) {
										el.href = link;
										el.classList.remove('hidden');
										return;
									}
								}
								el.classList.add('hidden');
							});
						}
		});
	});
	
	// Initializing the lightbox
	if (document.querySelectorAll('.card.video,.card.image,.aday').length) {
		lightbox.init();
	}
