(function($){

	$(function(){

		var gitchecked = new gitChecked({
			version: 	'1.1.0',
		});

		gitchecked.latest();

		$('#format-data-stepper').activateStepper();
		$('#generate-report-stepper').activateStepper();
		$('#revise-report-stepper').activateStepper();
		$('select').material_select();
		$('#cancellation-type-cd').parent().parent().hide();
		$('.button-collapse').sideNav();
		$('.datepicker').pickadate({
			selectMonths: true, // Creates a dropdown to control month
			selectYears: 5, // Creates a dropdown of 15 years to control year
			format: 'mm/dd/yyyy',
			closeOnSelect: true,
		});
		$('#transaction-gross-premium-amt').change(calculate_comm);
		$('#commission-per').change(calculate_comm);

		var clipboard = new Clipboard('#copy-button');

		clipboard.on('success', function(e) {
			Materialize.toast('Data Copied!', 4000);

			e.clearSelection();
		});

		clipboard.on('error', function(e) {
			Materialize.toast('Data not Copied! Something went wrong!', 4000);
		});

		$('.btn').click( function() {

			var target = $(this).attr('data-ipc-tool');

			if( typeof target === typeof undefined )
				return;

			$('.tool').hide();
			$(target).show();

			if( '#toolbox-intro' !== target )
				$('#reset-toolbox').show();

			else
				$('#reset-toolbox').hide();

		});

		$('#reset-toolbox').click( function() {
			location.reload();
		});

		$('#policy-transaction-type-cd').change( function(){

			var type_code =$(this).val();

			if( 'CN' == type_code ) {

				$('#cancellation-type-cd').parent().parent().show();

			} else {

				$('#cancellation-type-cd').parent().parent().hide();

			}

		});

	}); // end of document ready

})(jQuery); // end of jQuery name space
