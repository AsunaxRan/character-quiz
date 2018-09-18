"use strict";

var img_path				= "imgs/characters/";
var quiz_list				= [];
var total_quiz				= 15;
var current_quiz			= 0;
var total_point				= 0;
var timer;
var time_remaining			= 5;
var quiz_correct_count;
var combo 					= 0;
var current_quiz_item;

$(window).on('load', function() {
	$('.preloader').fadeOut('fast');
});

function reset() {
	current_quiz = 0;
	total_point = 0;
	quiz_correct_count = 0;
	combo = 0;
}

function getData() {
	$.getJSON('data/characters.json', function(data, status) {
		$.each(data, function(key, val) {
			quiz_list.push(val);
		});
	});
}

function shuffle(data) {
	var counter = data.length;

    // While there are elements in the array
    while (counter > 0) {
        var index = Math.floor(Math.random() * counter);
        counter--;

        var temp 		= data[counter];
        data[counter] 	= data[index];
        data[index] 	= temp;
    }

    return data;
}

function makeQuiz() {
	shuffle(quiz_list);
	for (var i = 0; i < total_quiz; i++) {
		var answers = [
			[1, quiz_list[i][1]],
			[0, quiz_list[i][3][0]],
			[0, quiz_list[i][3][1]],
			[0, quiz_list[i][3][2]]
		];
		shuffle(answers);
		var quiz_item = '<div class="quiz-item" data-item="' + i + '">' +
							'<div class="hidden-character">' +
								'<div class="img-holder">' +
									'<img src="' + img_path + quiz_list[i][2] + '" alt="Hidden character" class="img-responsiveY hidden-character-item">' +
								'</div>' +
							'</div>' +
							'<div class="answers">' +
								'<div class="option">' +
									'<button class="btn full-width text-ellipsis answer" data-correct="' + answers[0][0] + '" onclick="check(this)">' + 
										answers[0][1] + 
									'</button>' +
								'</div>' +
								'<div class="option">' +
									'<button class="btn full-width text-ellipsis answer" data-correct="' + answers[1][0] + '" onclick="check(this)">' + 
										answers[1][1] + 
									'</button>' +
								'</div>' +
								'<div class="option">' +
									'<button class="btn full-width text-ellipsis answer" data-correct="' + answers[2][0] + '" onclick="check(this)">' + 
										answers[2][1] + 
									'</button>' +
								'</div>' +
								'<div class="option">' +
									'<button class="btn full-width text-ellipsis answer" data-correct="' + answers[3][0] + '" onclick="check(this)">' + 
										answers[3][1] + 
									'</button>' +
								'</div>' +
							'</div>' +
						'</div>';
		$('.quiz-wrap').append(quiz_item);
	}
}

function clean() {
	$('.quiz-wrap').html('');
	$('#total-point').text(total_point);
	$('#current-quiz').text(current_quiz);
	$('#total-quiz').text(total_quiz);
}

function timing() {
	time_remaining = 5;
	$('#progress').css('width', '100%');
	timer = setInterval(function(){
		time_remaining -= 0.5;
	    $('#progress').css('width', time_remaining * 20 + "%");
	    if (time_remaining == 0) {
	    	clearInterval(timer);
	    	$(current_quiz_item).find('.answer').css('pointer-events', 'none');
	    	$('#music-miss')[0].play();
	    	combo = 0;
	    }
	}, 500);
}

function openScreen(screen) {
	$('.screen').removeClass('open');
	$(screen).addClass('open');
}

function play() {
	reset();
	clean();
	makeQuiz();
	openScreen('#in-process');
	$('#music-bg')[0].volumn = 0.7;
	$('#music-bg')[0].play();
	nextQuiz();
}

function counter(current_point, new_point) {
	$({ Counter: current_point }).animate({ Counter: new_point }, {
		duration: 500,
		easing: 'swing',
		step: function() {
			$('#total-point').text(Math.ceil(this.Counter));
		},
		complete: function() {
			$('#total-point').text(new_point);
		}
	});
}

function check(answer) {
	var data_correct = $(answer).data('correct');
	$(current_quiz_item).find('.answer').css('pointer-events', 'none');
	clearInterval(timer);
	if (data_correct) {
		$(answer).addClass('correct');
		$(current_quiz_item).find('.hidden-character-item').addClass('show');
		quiz_correct_count++;
		combo++;
		$('.bonus').addClass('show');
		$('#bonus-combo').text(combo);
		var current_point = total_point;
		total_point += time_remaining * 100 * combo;
		counter(current_point, total_point);
		$('#music-correct')[0].play();
	} else {
		$(answer).addClass('incorrect');
		combo = 0;
		$('#music-incorrect')[0].play();
	}
}

function nextQuiz() {
	$('.bonus').removeClass('show');
	if (current_quiz == total_quiz) {
		endQuiz();
	} else {
		current_quiz++;
		current_quiz_item = $('.quiz-item:nth-child(' + current_quiz + ')');
		$('.quiz-item').removeClass('show');
		$(current_quiz_item).addClass('show');
		$('#current-quiz').text(current_quiz);
		clearInterval(timer);
		timing();
	}
}

function endQuiz() {
	openScreen('#end');
	$('#end-point').text(total_point);
	$('#number-correct').text(quiz_correct_count);
	$('#number-incorrect').text(total_quiz - quiz_correct_count);

	$('#music-bg')[0].pause();
	if (quiz_correct_count > total_quiz / 2) {
		$('#music-end')[0].play();
	} else {
		$('#music-gameover')[0].play();
	}

	var shape_correct = (quiz_correct_count / total_quiz) * 100;
	$('#shape-correct').css('width', shape_correct + '%');
	$('#shape-incorrect').css('width', (100 - shape_correct) + '%');
}


getData();