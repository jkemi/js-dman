//
// Place verbatim copy of dman-min.js at top of example.js or include it via html (head section)
//

// Create dependency object
var dep = new DM();

// Create a task to load in jquery, name task 'jq'
dep.onDoneJS(
	'jq',														// name of task
	[],															// jquery has no dependencies
	'//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.js',	// source url
	function(){													// detection function (detect already loaded jquery)
		return window.jQuery != undefined;
	}
);

// Create a task 'doc' that other tasks can depend on
dep.task('doc', null);

// Create an action, that is finished when document is loaded
dep.onDone(
	'docready'		// debug name of action
	['jq'],			// we use $(document).ready, so this task depends on jquery('jq')
	function(){		// function simply marks task 'doc' as finished when executed.
		$(document).ready(function(){dep.markDone('doc');});
	}
);

// create a global function, 'our_function' that users can call,
// which internally depend on 'doc' (and therefore also 'jq') being finished.
our_function = function(html_id_to_replace, replacement_str) {
	dep.onDone(
		'replace',	// name of internal task
		['doc'],	// we need document to be loaded into browser (task 'doc')
		function(){
			$('#'+html_id_to_replace).replaceWith(replacement_str);
		}
	);
};
