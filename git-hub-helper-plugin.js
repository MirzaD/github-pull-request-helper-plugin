var pullRequestHelperPlugin = new function(){
	let helper = this;
	const buttonSection=`<div id='ghhp-buttons-panel' style='position:fixed; right:0; bottom:0;'></div>`;
	const expandAllSectionsButton = `<button id="expand-all-secitions" class="btn btn-sm" type="button" data-disable-with="">
	<svg aria-hidden="true" class="octicon octicon-unfold position-relative mr-1" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path fill-rule="evenodd" d="M11.5 7.5L14 10c0 .55-.45 1-1 1H9v-1h3.5l-2-2h-7l-2 2H5v1H1c-.55 0-1-.45-1-1l2.5-2.5L0 5c0-.55.45-1 1-1h4v1H1.5l2 2h7l2-2H9V4h4c.55 0 1 .45 1 1l-2.5 2.5zM6 6h2V3h2L7 0 4 3h2v3zm2 3H6v3H4l3 3 3-3H8V9z"></path></svg>
		<div class='ghhp-label'>Expand All(e)</div>
	</button>`;
	const colapseAllSectionsButton = `<button id="colapse-all-secitions" class="btn btn-sm" type="button" data-disable-with="">
	<svg aria-hidden="true" class="octicon octicon-fold position-relative mr-1" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path fill-rule="evenodd" d="M7 9l3 3H8v3H6v-3H4l3-3zm3-6H8V0H6v3H4l3 3 3-3zm4 2c0-.55-.45-1-1-1h-2.5l-1 1h3l-2 2h-7l-2-2h3l-1-1H1c-.55 0-1 .45-1 1l2.5 2.5L0 10c0 .55.45 1 1 1h2.5l1-1h-3l2-2h7l2 2h-3l1 1H13c.55 0 1-.45 1-1l-2.5-2.5L14 5z"></path></svg>
		<div class='ghhp-label'>Collapse All(c)</div>
	</button>`;
	  const jumpToNextComment = `<button id="next-comment" class="btn btn-sm" type="button" data-disable-with="">
	  <strong style='font-weight: 900;'>></strong> <div class='ghhp-label'>Next comment(j)</div> 
	</button>`;
	const jumpToPreviousComment = `<button id="previous-comment" class="btn btn-sm" type="button" data-disable-with="">
	<strong style='font-weight: 900;'><</strong> <div class='ghhp-label'>Previous comment(k)</div> 
	</button>`;
	const menuButton = `<button id="menu-toggle" class="btn btn-sm" type="button" data-disable-with="">
	<svg aria-hidden="true" class="octicon octicon-gear" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path fill-rule="evenodd" d="M14 8.77v-1.6l-1.94-.64-.45-1.09.88-1.84-1.13-1.13-1.81.91-1.09-.45-.69-1.92h-1.6l-.63 1.94-1.11.45-1.84-.88-1.13 1.13.91 1.81-.45 1.09L0 7.23v1.59l1.94.64.45 1.09-.88 1.84 1.13 1.13 1.81-.91 1.09.45.69 1.92h1.59l.63-1.94 1.11-.45 1.84.88 1.13-1.13-.92-1.81.47-1.09L14 8.75v.02zM7 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"></path></svg>
	</button>`;
	const menuOptions = `
	<ul id='ghhp-menu' style='position:fixed !important; right:0 !important; bottom:0 !important; 
	list-style: none;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid rgba(27,31,35,0.15);
    border-radius: 4px;
	box-shadow: 0 3px 12px rgba(27,31,35,0.15);
	margin-bottom: 29px'>
        <li><a class="dropdown-item" href="#" id='toggle-compact'>
          Compact (.)
        </a></li>
        <li><a class="dropdown-item" id='toggle-full-width' href="#">
          Full Width (f)
        </a></li>
        <li class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="https://github.com/MirzaD/github-pull-request-helper-plugin" data-ga-click="Header, go to help, text:help">
          About
        </a></li>
      </ul>
	`;

	let currentComment = null;
	let commentCount = 0;

	document.onkeydown=nextpage; 
	function nextpage(e){
		let event = document.all ? window.event : e;
		const isNotInSomeTextField = !/^(?:input|textarea|select|button)$/i.test(e.target.tagName);

		if (isNotInSomeTextField) {
			setUpHotkeyFunctions();
		}

		function setUpHotkeyFunctions(){
			if(event.keyCode==74){
				onNextClicked();
			}
			if(event.keyCode==75){
				onPreviouslicked();
			}
			if(event.keyCode==69){
				onExpandAllClicked();
			}
			if(event.keyCode==67){
				onCollapseAllClicked();
			}
			if(event.keyCode==70){
				toggleFullWidth();
			}
			if(event.keyCode==190){
				toggleCompact();
			}
		}
	}
	
	helper.onPageLoaded = function(){
		if (window.location.host.indexOf('github.') > -1 && window.location.host.indexOf('.com') > -1 ){
			initPlugin();
			
			// Re-evaluate options to disable on PR pages
			// $("body").on("click", "a", function() {
			// 	if((this).attr('href')!=='#'){
			// 		initPlugin($(this).attr('href'), true);
			// 	}
			// });
		}
	}

	function initPlugin(href, soft=false){
		cleanExistingControls();
		addConstrols();
		attachClickHandlers();
		loadLocalStorage(soft);

		log('GitHub plugin loaded')
	}

	function cleanExistingControls(){
		$('#ghhp-buttons-panel').remove();
	}

	function loadLocalStorage(soft=false){
		helper.state = null;
		try{
			helper.state = JSON.parse(localStorage.getItem("ghhp"))
		}
		catch(e){};
		if (helper.state === null || helper.state === undefined){
			helper.state = {
				compact: false,
				fullWidth: false
			}
			updateLocalStorage();
		}

		restoreCompactState();
		restoreWidthState();

		function restoreCompactState(){
			if (helper.state.compact){
				helper.state.compact = !helper.state.compact;
				toggleCompact();
			}
		}

		function restoreWidthState(){
			if (helper.state.fullWidth && !soft){
				helper.state.fullWidth = !helper.state.fullWidth;
				toggleFullWidth();
			}
		}
	}

	function updateLocalStorage(){
		localStorage.setItem("ghhp", JSON.stringify(helper.state));
	}

	function addConstrols(){
		$('body').append(buttonSection);
		$('#ghhp-buttons-panel').append(expandAllSectionsButton);
		$('#ghhp-buttons-panel').append(colapseAllSectionsButton);
		$('#ghhp-buttons-panel').append(jumpToNextComment);
		$('#ghhp-buttons-panel').append(jumpToPreviousComment);
		$('#ghhp-buttons-panel').append(menuButton);

		if($('#ghhp-menu').length > 0){
			$('#ghhp-menu').remove();
		}
	}

	function attachClickHandlers(){
		$('#ghhp-buttons-panel #expand-all-secitions').on('click', function(){
			log('expanding');
			onExpandAllClicked();
		});

		$('#ghhp-buttons-panel #colapse-all-secitions').on('click', function(){
			log('colapsing');
			onCollapseAllClicked();
		});

		$('#ghhp-buttons-panel #next-comment').on('click', function(){
			log('going to next');
			onNextClicked();
		});

		$('#ghhp-buttons-panel #previous-comment').on('click', function(){
			log('going to previous');
			onPreviouslicked();
		});

		$('#ghhp-buttons-panel #menu-toggle').on('click', function(){
			log('toggle menu');
			toggleMenuItems();
		});

		$("body").on('click', '#toggle-compact', function(e){
			log('toggle compact');
			e.preventDefault();
			toggleCompact();
		});

		$("body").on('click', '#toggle-full-width', function(e){
			log('toggle full width');
			e.preventDefault();
			toggleFullWidth();
		});
	}

	function toggleCompact(){
		$('#ghhp-buttons-panel').toggleClass('compact');
		helper.state.compact = !helper.state.compact;
		updateLocalStorage();
		if($('#ghhp-menu').is(':visible')){
			toggleMenuItems();
		}
	}

	function toggleFullWidth(){
		$('.container.new-discussion-timeline').toggleClass('ghhp-full-width');
		$('.discussion-timeline.pull-discussion-timeline').toggleClass('ghhp-full-width-content');
		helper.state.fullWidth = !helper.state.fullWidth;
		updateLocalStorage();
		if($('#ghhp-menu').is(':visible')){
			toggleMenuItems();
		}
	}

	function toggleMenuItems(){
		let options = $('body').find('#ghhp-menu');

		// If already injected into html
		if(options.length > 0){
			if (options.is(':visible')){
				options.hide();
			}else{
				options.show();
			}
		}else{
			$('body').append(menuOptions);
		}
	}

	function onNextClicked(){
		if (currentComment == null){
			currentComment=$('.review-comment:visible').first();
			scrollTo(currentComment);
			return;
		}

		commentCount++;
		try{
			currentComment=$('.review-comment:visible')[commentCount];
		}
		catch(e){
			commentCount=0;
			currentComment=$('.review-comment:visible')[commentCount];
		}

		scrollTo($(currentComment));	
	}

	function onPreviouslicked(){
		if (currentComment == null){
			currentComment=$('.review-comment:visible').last();
			commentCount=$('.review-comment:visible').length-1;
			scrollTo(currentComment);
			return;
		}

		commentCount--;
		try{
			currentComment=$('.review-comment:visible')[commentCount];
		}
		catch(e){
			commentCount=$('.review-comment:visible').length-1;
			currentComment=$('.review-comment:visible')[commentCount];
		}

		scrollTo($(currentComment));	
	}

	function onCollapseAllClicked(){
		helper.collapseButtons = $('.js-comment-container.open button.show-outdated-button');
		helper.collapseButtons.each(function(){
			console.log(this);
			commentCount=0;
			currentComment=null;
			$(this).click();
		})
	}

	function onExpandAllClicked(){
		helper.expandButtons = $('.js-comment-container').not('.open').find('button.show-outdated-button');
		helper.expandButtons.each(function(){
			console.log(this);
			commentCount=0;
			currentComment=null;
			$(this).click();
		})
	}

	function scrollTo(element){
		$('html, body').animate({
			scrollTop: element.offset().top
		}, 300);
	}
}

$(function(){	
	pullRequestHelperPlugin.onPageLoaded();
});

function log(msg){
	console.log("GHHP: " + msg);
}
