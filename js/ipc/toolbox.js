(function($) {

})(jQuery);

var raw_data,
	entities = [ 'Control', 'Policy', 'Unit', 'Coverage', 'Limit', 'Deductible', 'Rating', 'Exposure' ],
	header_labels = [
		[ 'ENTITY_TYPE', 'BATCH_ID', 'SUBMITTER_ID', 'POLICY_HEADER_COUNT', 'RISK_UNIT_COUNT', 'POLICY_COVERAGE_COUNT', 'RATING_INFO_COUNT', 'POLICY_FORM_COUNT', 'TOTAL_PREMIUM_AMT', 'TOTAL_COMMISSION_AMT', 'TOTAL_TAX_FEE_SURCH_AMT'],
		[ 'ENTITY_TYPE', 'POLICY_HEADER_ID', 'ACCOUNT_CURRENT_DT', 'INVOICE_POST_DT', 'AMENDMENT_REASON_CD', 'ARCH_PRODUCER_CD', 'AS_OF_TS', 'AUDIT_FREQUENCY_CD', 'AUDITABLE_FLG', 'BATCH_ID', 'BOUND_PREMIUM_AMT', 'BRANCH_OFFICE_CD', 'BUSINESS_SECTION_CD', 'CANCELLATION_COUNTRY_CD', 'CANCELLATION_EFFECTIVE_DT', 'CANCELLATION_STATE_CD', 'CANCELLATION_TYPE_CD', 'CREDIT_REASON_TXT', 'CROSS_BORDER_TYPE_CD', 'CURRENCY_CD', 'DBA_NM', 'DIRECT_OR_ASSUMED_IND', 'ENDORSEMENT_NO', 'INSURED_CITY_NM', 'INSURED_COUNTRY_CD', 'INSURED_NM', 'INSURED_PHONE_NO', 'INSURED_POSTAL_CD', 'INSURED_STATE_CD', 'INSURED_STREET_1_TXT', 'INSURED_STREET_2_TXT', 'ISSUING_COMPANY_CD', 'LEGAL_ENTITY_TYPE_CD', 'LIFE_CYCLE_STATUS_CD', 'MANUALLY_RATED_PREMIUM_AMT', 'MARKETING_REGION_CD', 'MINIMUM_EARNED_PERCENT', 'MINIMUM_PREMIUM_AMT', 'MINIMUM_PREMIUM_OVERRIDE_AMT', 'SIC_CD', 'NAICS_CD', 'NEW_RENEWAL_IND', 'ORIGINATING_ARCH_PRODUCER_CD', 'ORIGINATING_BRANCH_OFFICE_CD', 'ORIGINATING_MARKETING_REGION_CD', 'ORIGINATING_UNDERWRITER_CD', 'PAYMENT_PLAN_CD', 'POLICY_CURRENCY_CD', 'POLICY_EFFECTIVE_DT', 'POLICY_EXPIRATION_DT', 'POLICY_NO', 'POLICY_STATUS_CD', 'POLICY_TRANSACTION_TYPE_CD', 'PRIMARY_EXCESS_CD', 'PRIMARY_RISK_COUNTRY_CD', 'PRIMARY_RISK_STATE_CD', 'PRIOR_COVERAGE_FLAG', 'PRODUCT_CD', 'RENEWAL_OF_POLICY_NO', 'SOURCE_SYSTEM_CD', 'SOURCE_SYSTEM_KEY', 'SOURCE_TRANSACTION_ID', 'SOURCE_TRANSACTION_POSTED_TS', 'SURPLUS_LINES_PRODUCER_CD','SURPLUS_LINES_PRODUCER_NAME', 'SURPLUS_LINES_PRODUCER_STREET1', 'SURPLUS_LINES_PRODUCER_STREET2', 'SURPLUS_LINES_PRODUCER_CITY', 'SURPLUS_LINES_PRODUCER_POSTAL_CD', 'SURPLUS_LINES_PRODUCER_PHONE_NO', 'SURPLUS_LINES_PRODUCER_FAX_NO', 'SURPLUS_LINES_PRODUCER_TRX_NO', 'SURPLUS_LINES_PRODUCER_FEIN_NO', 'SURPLUS_LINES_PRODUCER_LICENSE_NO', 'SURPLUS_LINES_PRODUCER_NJ_TRANS_NO', 'SURPLUS_LINES_PRODUCER_STATE_CD', 'SYMBOL_CD', 'TIER_CD', 'TRANSACTION_COMMISSION_AMT', 'TRANSACTION_DESC', 'TRANSACTION_EFFECTIVE_DT', 'TRANSACTION_EXPIRATION_DT', 'TRANSACTION_GROSS_PREMIUM_AMT', 'UNDERWRITER_CD', 'UNDERWRITER_EMAIL', 'UNDERWRITER_NM'],
		[ 'ENTITY_TYPE', 'UNIT_ID', 'BUILDING_NO', 'CONSTRUCTION_TYPE_CD', 'COUNTRY_CD', 'LOCATION_NM', 'LOCATION_NO', 'TAX_TERRITORY_CD', 'UNIT_CITY_NM', 'UNIT_POSTAL_CD', 'UNIT_SEQ', 'UNIT_STATE_CD', 'UNIT_STREET_1_TXT', 'UNIT_STREET_2_TXT'],
		[ 'ENTITY_TYPE', 'POLICY_COVERAGE_ID', 'CLAIMS_MADE_OR_OCCURRENCE_IND', 'COVERAGE_CD', 'COVERAGE_EFFECTIVE_DT', 'COVERAGE_EXPIRATION_DT', 'IS_PREM_IND', 'PRIMARY_EXCESS_CD', 'COVERAGEPREMIUM', 'ASLOB_CD', 'SUBLINE_CD' ],
		[ 'ENTITY_TYPE', 'COVLIM_ID', 'COVERAGE_CD', 'CURRENCY_CD', 'LIMIT_TYPE_CD', 'LIMIT_APPLICATION_CD', 'LIMIT_AMT' ],
		[ 'ENTITY_TYPE', 'COVDED_ID', 'CURRENCY_CD', 'DEDUCTIBLE_TYPE_CD', 'DEDUCTIBLE_APPLICATION_CD', 'DEDUCTIBLE_AMT' ],
		[ 'ENTITY_TYPE', 'RATING_INFO_ID', 'UNIT_SEQ', 'COVERAGE_CD', 'CLASS_CD', 'PREMIUM_AMT', 'COMMISSION_AMT' ],
		[ 'ENTITY_TYPE', 'COVEXP_ID', 'EXPOSURE_TYPE_CD', 'EXPOSURE_APPLICATION_CD', 'EXPOSURE_VALUE' ],
],
	policy_data = [],
	control_data = [ 'Control', 'BATCH_ID', '19361150', 0, 0, 0, 0, 0, 0, 0, 0 ],
	filtered_policies = [];

function ipc_error( element, message ) {

	$(element).val('').trigger('autoresize').showError(message);
	return $('#format-data-stepper').destroyFeedback();

}

function calculate_comm() {

	var premium = accounting.unformat( $('#transaction-gross-premium-amt').val() ),
		comm_per = accounting.unformat( $('#commission-per').val() );

	$('#transaction-gross-premium-amt').val( accounting.toFixed( premium, 2 ) );
	$('#transaction-commission-amt').val( accounting.toFixed( ( premium * ( comm_per / 100 ) ), 2 ) );

}

function strip_phone( raw_number ) {

	if( !raw_number )
		return raw_number;

	var clean_number;

	raw_number = raw_number.match(/[0-9]/g);
	raw_number = raw_number.slice(0, 10);

	clean_number = raw_number.join('');

	console.log(clean_number);

	return clean_number;

}

function get_line_index( line_name, field_name ) {

	var entity_ind = entities.indexOf(line_name);

	if( -1 === entity_ind )
		return 'Entity type (' + line_name + ') does not exist.';

	var line_ind = header_labels[entity_ind].indexOf(field_name);

	if( -1 === line_ind )
		return 'Header item (' + field_name + ') for ' + line_name + ' does not exist.';


	return line_ind;

}

function get_line_value( line_ind, field_name ) {

	if( policy_data[line_ind] == 'undefined' )
		return 'Policy data line (' + line_ind + ') does not exist.';

	var field_ind = get_line_index( 'Policy', field_name );

	if( field_ind !== parseInt(  Number(field_ind) ) )
		return field_ind;

	if( -1 == policy_data[line_ind][field_ind] )
		return 'Policy data line (' + line_ind + '), field name (' + field_name + ') does not exist.';

	return policy_data[line_ind][field_ind];

}

function validate_raw_data() {

	var line_ind = 0;
	policy_data = [];

	raw_data = Papa.parse( $('#policy_raw_data').val(), {
		delimiter: '|',
		skipEmptyLines: true,
	});

	if( 0 > Object.keys(raw_data.errors).length )
		return ipc_error( '#policy_raw_data', 'There was an error while parsing the data: ' + raw_data.errors.toString() );

	for( i = 0; i < raw_data.data.length; i++ ) {

		var data_line = raw_data.data[i], field_data = null;

		data_line.pop();

		if( 0 == data_line.length )
			continue;

		if( 3 !== data_line.length )
			return ipc_error( '#policy_raw_data', 'Line (' + ( i + 1 ) + ') does not contain 3 elements: "' + data_line.toString() + '"' );

		if( ( 0 == i ) || ( 'ENTITY_TYPE' == data_line[0] ) ) {

			var entity_exists = entities.indexOf(data_line[1]);

			if( -1 == entity_exists )
				return ipc_error( '#policy_raw_data', 'Entity type does not exist: ' + data_line[1] );

			if( 0 !== policy_data.length )
				line_ind++;

			policy_data[line_ind] = [];

		} else {

			if( -1 == header_labels[entities.indexOf(policy_data[line_ind][0])].indexOf(data_line[0]) )
				return ipc_error( '#policy_raw_data', 'Header label does not exist: ' + policy_data[line_ind][0] + ': ' + data_line[0] );

		}

		if( '*' === data_line[1] && !data_line[2] )
			return ipc_error( '#policy_raw_data', 'Line (' + i + ') Entity: "' + data_line[0] + '" - Required fields must pull data from Epic.' );

		field_data = ( !data_line[2] ) ? data_line[1] : data_line[2];

		policy_data[line_ind].push(field_data.trim());

	}

	$('#transaction-gross-premium-amt').val(accounting.unformat(policy_data[0][get_line_index('Policy', 'TRANSACTION_GROSS_PREMIUM_AMT')]));

	calculate_comm();

	$('#transaction-eff-dt').val(policy_data[0][get_line_index('Policy', 'POLICY_EFFECTIVE_DT')]);
	$('#transaction-exp-dt').val(policy_data[0][get_line_index('Policy', 'POLICY_EXPIRATION_DT')]);

	$('#format-data-stepper').nextStep();

}

function validate_form_data() {

	var validPolicyCd = [ 'NB', 'RB', 'EN', 'RI', 'CN' ],
		validCancelCd = [ 'F', 'P', 'S', 'M' ];

	for( i = 0; i < policy_data.length; i++ ) {

		var line = policy_data[i];
		var entity_ind = entities.indexOf(line[0]);

		for( j = 0; j < line.length; j++ ) {

			var header_label = header_labels[entity_ind][j],
				line_item = line[0] + '-' + header_label;

			switch( line_item ) {

				case 'Policy-ACCOUNT_CURRENT_DT':
				case 'Policy-INVOICE_POST_DT':
					var pol_eff_dt_ind 	= get_line_index( 'Policy', 'POLICY_EFFECTIVE_DT' );
					line[j]	= policy_data[i][pol_eff_dt_ind];
					break;

				case 'Policy-AMENDMENT_REASON_CD':

					if( ( 'CN' == $('#policy-transaction-type-cd').val() ) )
						line[j] = $('#amendment-reason-cd').val();

					else
						line[j] = '';

					break;

				case 'Policy-CANCELLATION_EFFECTIVE_DT':

					if( ( 'CN' == $('#policy-transaction-type-cd').val() ) ) {

						var canc_eff_ind 	= get_line_index( 'Policy', 'CANCELLATION_EFFECTIVE_DT' );
						line[canc_eff_ind]	= get_line_value( 0, 'POLICY_EFFECTIVE_DT' );

					}

					break;

				case 'Policy-CANCELLATION_TYPE_CD':

					if( ( 'CN' == $('#policy-transaction-type-cd').val() ) ) {

						if( -1 === validCancelCd.indexOf( $('#cancellation-type-cd').val() ) ){

							alert( 'Please select a valid policy transaction type.' );
							$('#format-data-stepper').destroyFeedback();
							return ;

						}

						line[j] = $('#cancellation-type-cd').val();

						var canc_country_ind 	= get_line_index( 'Policy', 'CANCELLATION_COUNTRY_CD' );
						line[canc_country_ind]	= 'US';

						var canc_eff_ind 	= get_line_index( 'Policy', 'CANCELLATION_EFFECTIVE_DT' );
						line[canc_eff_ind]	= get_line_value( 0, 'POLICY_EFFECTIVE_DT' );

						var canc_st_ind		= get_line_index( 'Policy', 'CANCELLATION_STATE_CD' );
						line[canc_st_ind]	= get_line_value( 0, 'INSURED_STATE_CD' )

					}

					break;

				case 'Policy-ENDORSEMENT_NO':
					line[j] = $('#endorsement-no').val();
					break;

				case 'Policy-INSURED_PHONE_NO':
				case 'Policy-SURPLUS_LINES_PRODUCER_PHONE_NO':
				case 'Policy-SURPLUS_LINES_PRODUCER_FAX_NO':
					line[j] = strip_phone(line[j]);
					break;

				case 'Policy-NEW_RENEWAL_IND':

					var renewal_of_pol_ind = get_line_index( 'Policy', 'RENEWAL_OF_POLICY_NO' );

					line[j] = (  5 >= line[renewal_of_pol_ind].length ) ? 'N' : 'R';

					break;

				case 'Policy-POLICY_STATUS_CD':
					line[j] = $('#policy-status-cd').val();
					break;

				case 'Policy-POLICY_TRANSACTION_TYPE_CD':

					if( -1 === validPolicyCd.indexOf( $('#policy-transaction-type-cd').val() ) ){

						alert( 'Please select a valid policy transaction type.' );
						$('#format-data-stepper').destroyFeedback();
						return ;

					}

					line[j] = $('#policy-transaction-type-cd').val();

					break;

				case 'Policy-PRIMARY_EXCESS_CD':
				case 'Coverage-PRIMARY_EXCESS_CD':

					if( 1 != $('#primary-excess-cd').val() && 5 != $('#primary-excess-cd').val() ){

						alert( 'Please select a valid policy type.' );
						$('#format-data-stepper').destroyFeedback();
						return;

					}

					line[j] = $('#primary-excess-cd').val();
					break;

				case 'Policy-PRIMARY_RISK_STATE_CD':
					var ins_state_cd_ind 	= get_line_index( 'Policy', 'INSURED_STATE_CD' );
					line[j]	= policy_data[i][ins_state_cd_ind];
					break;

				case 'Policy-RENEWAL_OF_POLICY_NO':
					console.log(line[j].length);
					line[j] = (  5 >= line[j].length ) ? '' : line[j];


					break;
				case 'Policy-SOURCE_TRANSACTION_POSTED_TS':

					line[j]	= new Date().toISOString();
					break;

				case 'Policy-TRANSACTION_COMMISSION_AMT':
				case 'Rating-COMMISSION_AMT':

					line[j]	= parseFloat( $('#transaction-commission-amt').val() );
					break;

				case 'Policy-TRANSACTION_EFFECTIVE_DT':

					var trans_eff_dt = new Date( $('#transaction-eff-dt').val() ),
						pol_eff_dt = new Date( policy_data[i][get_line_index( 'Policy', 'POLICY_EFFECTIVE_DT' )] );
						pol_exp_dt = new Date( policy_data[i][get_line_index( 'Policy', 'POLICY_EXPIRATION_DT' )] );

					if( !$('#transaction-eff-dt').val() ) {

						alert( 'Transaction Effective Date must be set.' );
						$('#format-data-stepper').destroyFeedback();
						return ;

					}

					if( ( trans_eff_dt.getTime() < pol_eff_dt.getTime() ) || ( trans_eff_dt.getTime() > pol_exp_dt.getTime() ) ) {

						alert( 'Transaction Effective Date must occur on or between the Policy Effective Date (' + policy_data[i][get_line_index( 'Policy', 'POLICY_EFFECTIVE_DT' )] + ') and the Policy Expiration Date (' + policy_data[i][get_line_index( 'Policy', 'POLICY_EXPIRATION_DT' )] + ').' );
						$('#format-data-stepper').destroyFeedback();
						return ;

					}

					line[j]	= $('#transaction-eff-dt').val();

					break;

				case 'Policy-TRANSACTION_EXPIRATION_DT':

					var trans_eff_dt = new Date( $('#transaction-eff-dt').val() ),
						trans_exp_dt = new Date( $('#transaction-exp-dt').val() ),
						pol_eff_dt = new Date( policy_data[i][get_line_index( 'Policy', 'POLICY_EFFECTIVE_DT' )] );
						pol_exp_dt = new Date( policy_data[i][get_line_index( 'Policy', 'POLICY_EXPIRATION_DT' )] );

					if( !$('#transaction-exp-dt').val() ) {

						alert( 'Transaction Expiration Date must be set.' );
						$('#format-data-stepper').destroyFeedback();
						return ;

					}

					if( trans_exp_dt.getTime() <= trans_eff_dt.getTime() ) {

						alert( 'Transaction Expiration Date must occur after the Transaction Effective Date.' );
						$('#format-data-stepper').destroyFeedback();
						return;

					}

					if( ( trans_exp_dt.getTime() < pol_eff_dt.getTime() ) || ( trans_exp_dt.getTime() > pol_exp_dt.getTime() ) ) {

						alert( 'Transaction Expiration Date must occur after the Transaction Effective Date and before or on the Policy Expiration Date (' + policy_data[i][get_line_index( 'Policy', 'POLICY_EXPIRATION_DT' )] + ').' );
						$('#format-data-stepper').destroyFeedback();
						return ;

					}

					line[j]	= $('#transaction-exp-dt').val();
					break;

				case 'Policy-TRANSACTION_GROSS_PREMIUM_AMT':
				case 'Rating-PREMIUM_AMT':

					line[j]	= parseFloat( $('#transaction-gross-premium-amt').val().replace(/[^0-9.-]+/g, '') );
					break;

				case 'Unit-UNIT_SEQ':
					var loc_no_ind 	= get_line_index( 'Unit', 'LOCATION_NO' );
					line[j]	= policy_data[i][loc_no_ind];
					break;

				case '*Coverage-CLAIMS_MADE_OR_OCCURRENCE_IND':

					line[j]	= ( 9 < parseInt( $('#claims-made-ind').val() ) ) ? 0 : $('#claims-made-ind').val();
					break;

				case 'Limit-LIMIT_AMT':

					line[j]	= parseFloat( line[j].replace(/[^0-9.-]+/g, '') );
					break;

				case 'Exposure-EXPOSURE_TYPE_CD':

					switch( $('#exposure-application-cd').val() ) {

						case 'SALES':
							line[j] = '01';
							break;

						case 'VEHICLES':
							line[j] = '116';
							break;

						case 'EACH':
							line[j] = '116';
							break;

						default:
						alert( 'Invalid EXPOSURE_APPLICATION_CD returned.' );
						$('#format-data-stepper').destroyFeedback();
						return;

					}

					break;

				case 'Exposure-EXPOSURE_APPLICATION_CD':

					line[j] = $('#exposure-application-cd').val();
					break;


			}

		}

		policy_data[i] = line;

	}

	$('#formatted_data').html( Papa.unparse(policy_data, { delimiter: '|', }) );

	$('#format-data-stepper').nextStep();

}

function process_csv() {

	if( !$('#date-range-end').val() ) {

		alert('Both a start and end date are required.');
		return $('#generate-report-stepper').destroyFeedback();

	}

	var file	= $('#submitted-csv').prop('files')[0];
	var ext		= $('#submitted-csv').val().split('.').pop().toLowerCase();

	if( $.inArray(ext, ['txt', 'csv']) == -1) {

		alert('Not a valid file.');
		return $('#generate-report-stepper').destroyFeedback();

	}

	Papa.parse(file, {
		skipEmptyLines: true,
		before: function(file, inputElem)
		{
			console.log("Parsing file...", file);
		},
		error: function(err, file)
		{
			console.log("ERROR:", err, file);
			firstError = firstError || err;
			errorCount++;
			return $('#generate-report-stepper').destroyFeedback();
		},
		complete: function( results )
		{

			filter_policies( results.data );
			$('#generate-report-stepper').nextStep();

		}
	});

	$('#generate-report-stepper').destroyFeedback();

}

function filter_policies( policies ) {

	var slice_begin = 0,
		slice_end = 0,
		single_policy = [],
		policy_id = 16000,
		unit_id = 21000,
		loc_id = 1,
		limit_id = 13000,
		report_begin_dt = new Date( $('#date-range-start').val() ),
		report_end_dt = new Date( $('#date-range-end').val() ),
		acct_curre_dt = new Date();

	filtered_policies = [];
	control_data[3] = 0;
	control_data[4] = 0;
	control_data[5] = 0;
	control_data[6] = 0;
	control_data[7] = 0;
	control_data[8] = 0;
	control_data[9] = 0;
	control_data[10] = 0;

	for( i = 0; i < policies.length; i++ ) {
console.log(policies[i][0]);
		var line_entity = entities.indexOf(policies[i][0]);

		if( policies[i].length !== header_labels[line_entity].length ) {

			alert( 'There is a problem with the items in line ' + i + '. Length should be ' + header_labels[line_entity].length + ' items long but is ' + policies[i].length + '.' );
			$('#generate-report-stepper').destroyFeedback();

		}

		if( ( i != 0 && 'Policy' == policies[i][0] ) || ( ( policies.length - 1 ) == i ) ) {

			slice_end = ( ( policies.length - 1 ) == i ) ? policies.length : i;

			acct_curre_dt = new Date( policies[slice_begin][get_line_index( 'Policy', 'ACCOUNT_CURRENT_DT' )] );

			if( ( acct_curre_dt.getTime() >= report_begin_dt.getTime() ) && ( acct_curre_dt.getTime() <= report_end_dt.getTime() ) ) {

				//policies[slice_begin][get_line_index( 'Policy', 'ACCOUNT_CURRENT_DT' )] = '';

				filtered_policies = filtered_policies.concat( policies.slice(slice_begin, slice_end) );

			}

			slice_begin = i;

		}

	}

	for( i = 0; i < filtered_policies.length; i++ ) {
console.log('Filtered - ' + filtered_policies[i][0]);
		switch( filtered_policies[i][0] ) {

			case 'Policy':
				policy_id = policy_id + 1;

				filtered_policies[i][1] = policy_id;

				control_data[3]++;

				control_data[8] = accounting.toFixed( parseFloat(control_data[8]) + parseFloat(filtered_policies[i][get_line_index('Policy', 'TRANSACTION_GROSS_PREMIUM_AMT')]), 2 );
				control_data[9] = accounting.toFixed( parseFloat(control_data[9]) + parseFloat(filtered_policies[i][get_line_index('Policy', 'TRANSACTION_COMMISSION_AMT')]), 2 );
				break;

			case 'Unit':

				unit_id = unit_id + 1;
				loc_id = filtered_policies[i][get_line_index('Unit', 'LOCATION_NO')]

				filtered_policies[i][1] = unit_id;

				control_data[4]++
				break;

			case 'Coverage':

				filtered_policies[i][1] = unit_id;

				control_data[5]++
				break;

			case 'Limit':

				limit_id = limit_id + 1;

				filtered_policies[i][1] = String(unit_id) + String(limit_id);

				break;

			case 'Deductible':

				filtered_policies[i][1] = String(unit_id) + String(limit_id);

				break;

			case 'Rating':

				filtered_policies[i][1] = unit_id;
				filtered_policies[i][get_line_index('Rating', 'UNIT_SEQ')] = loc_id;

				control_data[6]++
				break;

			case 'Exposure':

				filtered_policies[i][1] = unit_id;

				break;

		}

	}

	$('#header-count').html(control_data[3]);
	$('#unit-count').html(control_data[4]);
	$('#coverage-count').html(control_data[5]);
	$('#rating-count').html(control_data[6]);
	$('#total-premium').html(control_data[8]);
	$('#total-commission').html(control_data[9]);

}

function revise_report() {

	var file	= $('#submitted-report').prop('files')[0];
	var ext		= $('#submitted-report').val().split('.').pop().toLowerCase();

	policy_data = [];

	if( $.inArray(ext, ['txt', 'csv']) == -1) {

		alert('Not a valid file.');
		return $('#revise-report-stepper').destroyFeedback();

	}

	Papa.parse(file, {
		skipEmptyLines: true,
		before: function(file, inputElem)
		{
			console.log("Parsing file...", file);
		},
		error: function(err, file)
		{
			console.log("ERROR:", err, file);
			firstError = firstError || err;
			errorCount++;
			return $('#revise-report-stepper').destroyFeedback();
		},
		complete: function( results )
		{

			policy_data = results.data;

			if( 'Control' != policy_data[0][0] )  {

				alert('Not a valid report.');
				return $('#revise-report-stepper').destroyFeedback();

			}

			//build_revise_fields();

			build_report_table();

			$('#revise-report-stepper').nextStep();

		}
	});

	$('#revise-report-stepper').destroyFeedback();

}

function build_report_table() {

	$('#report-data tbody').html('');

	var policy_id = 0;

	for( i = 0; i < policy_data.length; i++ ) {

		policy_id = ( policy_data[i][0] == 'Policy' ) ?  i: policy_id;

		var policy_no = ( 0 == i) ? 'Control' : policy_data[policy_id][get_line_index( 'Policy', 'POLICY_NO' )];

		for( j = 0; j < policy_data[i].length; j++ ) {

			$('#report-data tbody').append('<tr><td>' + ( i + 1 ) + '</td><td>' + policy_no + '</td><td>' + policy_data[i][0] + '</td><td>' + header_labels[entities.indexOf(policy_data[i][0])][j] + '</td><td contenteditable="true">' + policy_data[i][j] + '</td></tr>\n');

		}

	}

}

function generate_report() {

	var link = document.createElement('a'), generate_date = new Date();

	generate_id = generate_date.getTime();

	control_data[1] = generate_id;

	for( i = 0; i < filtered_policies; i++ ) {

		if( 'Policy' == filtered_policies[i][0] ) {

			filtered_policies[i][get_line_index('Policy', 'BATCH_ID')] = generate_id;

		}

	}

	filtered_policies.unshift(control_data);

	var csv_string = Papa.unparse( filtered_policies, {
		delimiter:	'|',
		newline:	'\r\n',
	} );

	link.href        = 'data:attachment/csv,' + encodeURI(csv_string);
	link.target      = '_blank';
	link.download    = 'arch-report_' + generate_id + '.csv';

	document.body.appendChild(link);

	link.click();
	link.remove();

	$('#generate-report-stepper').destroyFeedback();

}

function generate_revised_report() {

	var table_data = [], data_change = false;

	$('#report-data tr').each( function( row, tr ) {

		table_data[row] = [
			$(tr).find('td:eq(0)').text(),
			$(tr).find('td:eq(1)').text(),
			$(tr).find('td:eq(2)').text(),
			$(tr).find('td:eq(3)').text(),
			$(tr).find('td:eq(4)').text(),
		];

	});

	table_data.shift();

	for( i = 0; i < table_data.length; i++ ) {

		if( table_data[i][4] != policy_data[parseInt(table_data[i][0] - 1)][get_line_index(table_data[i][2], table_data[i][3])] ) {

			data_change = true;

			policy_data[parseInt(table_data[i][0] - 1)][get_line_index(table_data[i][2], table_data[i][3])] = table_data[i][4];

		}

	}

	if( data_change ) {

		var link = document.createElement('a'), generate_date = new Date();

		generate_id = generate_date.getTime();

		var csv_string = Papa.unparse( policy_data, {
			delimiter:	'|',
			newline:	'\r\n',
		} );

		link.href        = 'data:attachment/csv,' + encodeURI(csv_string);
		link.target      = '_blank';
		link.download    = 'arch-report_Revised-' + policy_data[0][1] + '_' + generate_id + '.csv';

		document.body.appendChild(link);

		link.click();
		link.remove();

		$('#revise-report-stepper').destroyFeedback();

	} else {

		alert('No changes were made to the data.');
		$('#revise-report-stepper').destroyFeedback();

	}

}
