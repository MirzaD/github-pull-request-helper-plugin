
var pullRequestHelperPlugin = new function(){
	let helper = this;
	const buttonSection=`<div id='ghhp-buttons-panel' style='position:fixed; right:0; bottom:0;'></div>`;
	const expandAllSectionsButton = `<button id="expand-all-secitions" class="btn btn-sm" type="button" data-disable-with="">
	<svg aria-hidden="true" class="octicon octicon-unfold position-relative mr-1" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path fill-rule="evenodd" d="M11.5 7.5L14 10c0 .55-.45 1-1 1H9v-1h3.5l-2-2h-7l-2 2H5v1H1c-.55 0-1-.45-1-1l2.5-2.5L0 5c0-.55.45-1 1-1h4v1H1.5l2 2h7l2-2H9V4h4c.55 0 1 .45 1 1l-2.5 2.5zM6 6h2V3h2L7 0 4 3h2v3zm2 3H6v3H4l3 3 3-3H8V9z"></path></svg>
		Expand All
	</button>`;
	const colapseAllSectionsButton = `<button id="colapse-all-secitions" class="btn btn-sm" type="button" data-disable-with="">
	<svg aria-hidden="true" class="octicon octicon-fold position-relative mr-1" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path fill-rule="evenodd" d="M7 9l3 3H8v3H6v-3H4l3-3zm3-6H8V0H6v3H4l3 3 3-3zm4 2c0-.55-.45-1-1-1h-2.5l-1 1h3l-2 2h-7l-2-2h3l-1-1H1c-.55 0-1 .45-1 1l2.5 2.5L0 10c0 .55.45 1 1 1h2.5l1-1h-3l2-2h7l2 2h-3l1 1H13c.55 0 1-.45 1-1l-2.5-2.5L14 5z"></path></svg>
		Collapse All
	</button>`;
	  const jumpToNextComment = `<button id="next-comment" class="btn btn-sm" type="button" data-disable-with="">
	  <strong style='font-weight: 900;'>></strong> Next comment
	</button>`;
	const jumpToPreviousComment = `<button id="previous-comment" class="btn btn-sm" type="button" data-disable-with="">
	<strong style='font-weight: 900;'><</strong> Previous comment
	</button>`;

	let currentComment= null;
	let commentCount = 0;
	
	helper.onPageLoaded = function(){
		if (window.location.host.indexOf('github.') > -1 && window.location.host.indexOf('.com') > -1 ){
			initPlugin();
			log('GitHub plugin loaded')
		}
	}

	function initPlugin(){
		addConstrols();
		attachClickHandlers();
	}

	function addConstrols(){
		$('body').append(buttonSection);
		$('#ghhp-buttons-panel').append(expandAllSectionsButton);
		$('#ghhp-buttons-panel').append(colapseAllSectionsButton);
		$('#ghhp-buttons-panel').append(jumpToNextComment);
		$('#ghhp-buttons-panel').append(jumpToPreviousComment);
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
/*try{
}
catch(){
	console.log("BBHP: Error");
}*/

