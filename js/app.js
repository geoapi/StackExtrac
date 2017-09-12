// StackOverflow request returns new result which gets appended to DOM
var showQuestion = function(question) {
	// Here is the template code from main HTML, and we clone the template element  
	result = $('.templates .question').clone();
	//	console.log(result);
	//console.log(result.find('*'));
	// Set the question properties in result
	var questionElement = result.find('.question-text a');

	//console.log(question.body);
	questionElement.attr('href', question.link);
	questionElement.text(question.title);
	// set the date the questions was asked in result
	var asked = result.find('.asked-date');
	var date = new Date(1000 * question.creation_date);
	asked.text(date.toString());

	// set the views that had happened for question in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set the html elements of the OP asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+
		'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +
		'</a></p>' +
		'<p>Reputation: ' + question.owner.reputation + '</p>' +
		'</a></p>' +
		'<p>body: ' + question.body + '</p>'
		 
	);
	//return the question object
	return result;
};

var showAnswers = function(answer) {

	var result = $('.templates .top-answers').clone();
	console.log(result);
	var answerElem = result.find('.answer-body');
	answerElem.text( answer.body );
	var answerScoreElem = result.find('.answer-score');
	answerScoreElem.text( answer.score );
	//console.log(answer.body, answer.votes);
	// var numberOfPosts = result.find('.number-of-posts');
	// numberOfPosts.attr(answer.post_count);
	// numberOfPosts.text(answer.post_count);
	//$('.number-of-posts').text(answer.post_count); 
	//console.log(answerer.post_count);
	// console.log(numberOfPosts.text(answerer.post_count));

	return result;

};

// this function takes the results object from StackOverflow
// and returns the number of results and search query to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query + '</strong>';
	// console.log(results);
	return results;
	};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElement = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElement.append(errorText);
};


// takes string of a tag to be searched at a time
var getTopAnswers = function(tag, ids) {  // the parameteres we need to pass in our request to StackOverflow's API
	var request = {
		tagged: tag,
		site: 'stackoverflow',
		order: 'desc',
		sort: 'votes'
	};
	// console.log(request, ids, tag);
	$.ajax({
		url: "http://api.stackexchange.com/2.2/questions/"+ ids +"/answers?order=desc&sort=activity&filter=withbody&key=keqVr01zTBktmTggfO2lMg((",
		data: request,  
		dataType: "jsonp", // why jsonp ? https://stackoverflow.com/questions/2067472/what-is-jsonp-all-about
		type: "GET"
	})

	.done(function(result){ 
		$('.search-results').html(result.item);  
		$.each(result.items, function(i, item) {  
			var answer = showAnswers(item);
			$('.results').append(answer);
		});
		//console.log(result);
	})
	.fail(function(jqXHR, error){ //waiting for ajax with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});

};

var searchQuestions = function(query) {
 	// parameters for our request to StackOverflow's API
	var request = { 
		q: query,
		site: 'stackoverflow',
		order: 'desc',
		sort: 'votes',
		accepted: 'true',
		tagged: 'api',
		filter: 'withbody' //makes sure that the content body returned, by default it doesn't

	};

	// the API call.
	
	$.ajax({
 		url: "https://api.stackexchange.com/2.2/search/advanced?",
		data: request,  
		dataType: "jsonp",// avoid cross origin issues
		type: "GET"
	})
	.done(function(result){
		//console.log(result);
		//console.log(result.items[0]);
		//console.log(request.q, request.tagged);
 		//console.log(result.items[0].owner.display_name);
		var searchResults = showSearchResults(request.q, result.items.length); // showing 30
		// to get more than 30 SO API has two options page size 100 or get another page for next 30
		$('.search-results').html(searchResults);  
		$.each(result.items, function(i, item) {  
			var question = showQuestion(item);
			$('.results').append(question);
		});
		
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};

$(document).ready( function() {
	$('.questions-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var query = $(this).find("input[name='query']").val();
		searchQuestions(query);
	});
	$('.answers-getter').submit( function(e) {
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tag = $(this).find("input[name = 'answers']").val();
		getTopAnswers(tag, "10302179");
	});
});



