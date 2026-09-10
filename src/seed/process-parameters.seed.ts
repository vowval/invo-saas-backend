import { DataSource } from 'typeorm';
import { ProcessParameter, ParameterDataType } from '../process-master/entities/process-parameter.entity';
import { Process } from '../process-master/entities/process.entity';

export const seedProcessParameters = async (dataSource: DataSource) => {
  const parameterRepository = dataSource.getRepository(ProcessParameter);
  const processRepository = dataSource.getRepository(Process);

  console.log('\nSeeding Process Parameters...');

  // Get processes by code for easy reference
  const getProcessByCode = async (code: string) => {
    return processRepository.findOne({
      where: { process_code: code, factory_id: null }, // Global processes
    });
  };

  // ============= WASHING PROCESSES =============

  // NORMAL WASH Parameters
  const normalWash = await getProcessByCode('WASH-NORM');
  if (normalWash) {
    const normalWashParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
        help_text: 'Select the washing machine to be used',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 2,
        help_text: 'Weight of fabric at input',
      },
      {
        parameter_code: 'WATER_QUANTITY',
        parameter_name: 'Water Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'liters',
        is_required: true,
        display_order: 3,
        help_text: 'Quantity of water to be used',
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 4,
        min_value: 20,
        max_value: 90,
      },
      {
        parameter_code: 'WASH_TIME',
        parameter_name: 'Wash Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 5,
      },
      {
        parameter_code: 'DETERGENT',
        parameter_name: 'Detergent',
        data_type: ParameterDataType.CHEMICAL,
        is_required: false,
        display_order: 6,
        help_text: 'Name/type of detergent used',
      },
      {
        parameter_code: 'DETERGENT_DOSAGE',
        parameter_name: 'Detergent Dosage',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: false,
        display_order: 7,
      },
      {
        parameter_code: 'PH',
        parameter_name: 'pH',
        data_type: ParameterDataType.PH,
        is_required: false,
        display_order: 8,
        min_value: 1,
        max_value: 14,
      },
      {
        parameter_code: 'NUMBER_OF_RINSES',
        parameter_name: 'Number of Rinses',
        data_type: ParameterDataType.INTEGER,
        is_required: false,
        display_order: 9,
        min_value: 1,
        max_value: 10,
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 10,
        help_text: 'Weight of fabric at output',
      },
      {
        parameter_code: 'REMARKS',
        parameter_name: 'Remarks',
        data_type: ParameterDataType.TEXT,
        is_required: false,
        display_order: 11,
        help_text: 'Any additional notes or observations',
      },
    ];

    for (const param of normalWashParams) {
      const existing = await parameterRepository.findOne({
        where: {
          process_id: normalWash.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });

      if (!existing) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: normalWash.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Normal Wash (${normalWashParams.length} parameters)`);
  }

  // RINSE WASH Parameters
  const rinseWash = await getProcessByCode('WASH-RINSE');
  if (rinseWash) {
    const rinseWashParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 2,
      },
      {
        parameter_code: 'WATER_QUANTITY',
        parameter_name: 'Water Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'liters',
        is_required: true,
        display_order: 3,
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 4,
      },
      {
        parameter_code: 'RINSE_TIME',
        parameter_name: 'Rinse Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 5,
      },
      {
        parameter_code: 'NUMBER_OF_RINSES',
        parameter_name: 'Number of Rinses',
        data_type: ParameterDataType.INTEGER,
        is_required: false,
        display_order: 6,
        min_value: 1,
        max_value: 10,
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 7,
      },
    ];

    for (const param of rinseWashParams) {
      const existing = await parameterRepository.findOne({
        where: {
          process_id: rinseWash.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });

      if (!existing) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: rinseWash.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Rinse Wash (${rinseWashParams.length} parameters)`);
  }

  // HOT WASH Parameters
  const hotWash = await getProcessByCode('WASH-HOT');
  if (hotWash) {
    const hotWashParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 2,
      },
      {
        parameter_code: 'WATER_QUANTITY',
        parameter_name: 'Water Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'liters',
        is_required: true,
        display_order: 3,
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 4,
        min_value: 50,
        max_value: 90,
        help_text: 'High temperature wash (50-90°C)',
      },
      {
        parameter_code: 'HOLDING_TIME',
        parameter_name: 'Holding Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 5,
      },
      {
        parameter_code: 'PH',
        parameter_name: 'pH',
        data_type: ParameterDataType.PH,
        is_required: false,
        display_order: 6,
      },
      {
        parameter_code: 'DETERGENT',
        parameter_name: 'Detergent',
        data_type: ParameterDataType.CHEMICAL,
        is_required: false,
        display_order: 7,
      },
      {
        parameter_code: 'DOSAGE',
        parameter_name: 'Dosage',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: false,
        display_order: 8,
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 9,
      },
    ];

    for (const param of hotWashParams) {
      const existing = await parameterRepository.findOne({
        where: {
          process_id: hotWash.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });

      if (!existing) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: hotWash.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Hot Wash (${hotWashParams.length} parameters)`);
  }

  // ENZYME WASH Parameters
  const enzymeWash = await getProcessByCode('WASH-ENZ');
  if (enzymeWash) {
    const enzymeWashParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 2,
      },
      {
        parameter_code: 'LIQUOR_RATIO',
        parameter_name: 'Liquor Ratio',
        data_type: ParameterDataType.DECIMAL,
        unit: '1:n',
        is_required: true,
        display_order: 3,
        help_text: 'Fabric to water ratio (e.g., 1:10)',
      },
      {
        parameter_code: 'WATER_QUANTITY',
        parameter_name: 'Water Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'liters',
        is_required: true,
        display_order: 4,
      },
      {
        parameter_code: 'ENZYME_TYPE',
        parameter_name: 'Enzyme Type',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 5,
        help_text: 'Name of enzyme (e.g., Cellulase, Amylase)',
      },
      {
        parameter_code: 'ENZYME_DOSAGE',
        parameter_name: 'Enzyme Dosage',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 6,
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 7,
        min_value: 40,
        max_value: 60,
        help_text: 'Enzyme wash typically at 40-60°C',
      },
      {
        parameter_code: 'TREATMENT_TIME',
        parameter_name: 'Treatment Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 8,
      },
      {
        parameter_code: 'PH',
        parameter_name: 'pH',
        data_type: ParameterDataType.PH,
        is_required: true,
        display_order: 9,
        min_value: 4,
        max_value: 7,
      },
      {
        parameter_code: 'DETERGENT',
        parameter_name: 'Detergent',
        data_type: ParameterDataType.CHEMICAL,
        is_required: false,
        display_order: 10,
      },
      {
        parameter_code: 'DOSAGE',
        parameter_name: 'Dosage',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: false,
        display_order: 11,
      },
      {
        parameter_code: 'NUMBER_OF_RINSES',
        parameter_name: 'Number of Rinses',
        data_type: ParameterDataType.INTEGER,
        is_required: true,
        display_order: 12,
        min_value: 2,
        max_value: 8,
      },
      {
        parameter_code: 'NEUTRALISATION',
        parameter_name: 'Neutralisation',
        data_type: ParameterDataType.TEXT,
        is_required: false,
        display_order: 13,
        help_text: 'Acid used for neutralization (e.g., Acetic acid dosage)',
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 14,
      },
    ];

    for (const param of enzymeWashParams) {
      const existing = await parameterRepository.findOne({
        where: {
          process_id: enzymeWash.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });

      if (!existing) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: enzymeWash.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Enzyme Wash (${enzymeWashParams.length} parameters)`);
  }

  // ============= DYEING PROCESSES =============

  // REACTIVE DYEING Parameters
  const reactiveDyeing = await getProcessByCode('DYE-REACTIVE');
  if (reactiveDyeing) {
    const reactiveDyeingParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
      },
      {
        parameter_code: 'BATCH_NUMBER',
        parameter_name: 'Batch Number',
        data_type: ParameterDataType.TEXT,
        is_required: true,
        display_order: 2,
        help_text: 'Unique batch identifier',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 3,
      },
      {
        parameter_code: 'FABRIC_TYPE',
        parameter_name: 'Fabric Type',
        data_type: ParameterDataType.TEXT,
        is_required: true,
        display_order: 4,
        help_text: 'e.g., Cotton, Polyester, Blend',
      },
      {
        parameter_code: 'FABRIC_GSM',
        parameter_name: 'Fabric GSM',
        data_type: ParameterDataType.QUANTITY,
        unit: 'g/m²',
        is_required: false,
        display_order: 5,
      },
      {
        parameter_code: 'COLOUR',
        parameter_name: 'Colour',
        data_type: ParameterDataType.COLOUR,
        is_required: true,
        display_order: 6,
      },
      {
        parameter_code: 'SHADE_CODE',
        parameter_name: 'Shade Code',
        data_type: ParameterDataType.SHADE,
        is_required: true,
        display_order: 7,
        help_text: 'Customer shade reference',
      },
      {
        parameter_code: 'RECIPE',
        parameter_name: 'Recipe',
        data_type: ParameterDataType.RECIPE,
        is_required: true,
        display_order: 8,
        help_text: 'Reference to approved recipe',
      },
      {
        parameter_code: 'LIQUOR_RATIO',
        parameter_name: 'Liquor Ratio',
        data_type: ParameterDataType.DECIMAL,
        unit: '1:n',
        is_required: true,
        display_order: 9,
      },
      {
        parameter_code: 'WATER_QUANTITY',
        parameter_name: 'Water Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'liters',
        is_required: true,
        display_order: 10,
      },
      {
        parameter_code: 'DYE_NAMES',
        parameter_name: 'Dye Names',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 11,
      },
      {
        parameter_code: 'DYE_QUANTITIES',
        parameter_name: 'Dye Quantities',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 12,
      },
      {
        parameter_code: 'SALT_QUANTITY',
        parameter_name: 'Salt Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 13,
        help_text: 'Sodium chloride for reactive dyeing',
      },
      {
        parameter_code: 'ALKALI_QUANTITY',
        parameter_name: 'Alkali/Soda Ash Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 14,
      },
      {
        parameter_code: 'SEQUESTERING_AGENT',
        parameter_name: 'Sequestering Agent',
        data_type: ParameterDataType.CHEMICAL,
        is_required: false,
        display_order: 15,
        help_text: 'Optional water hardness treatment',
      },
      {
        parameter_code: 'WETTING_AGENT',
        parameter_name: 'Wetting Agent',
        data_type: ParameterDataType.CHEMICAL,
        is_required: false,
        display_order: 16,
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 17,
      },
      {
        parameter_code: 'HEATING_RATE',
        parameter_name: 'Heating Rate',
        data_type: ParameterDataType.DECIMAL,
        unit: '°C/min',
        is_required: false,
        display_order: 18,
      },
      {
        parameter_code: 'HOLDING_TIME',
        parameter_name: 'Holding Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 19,
      },
      {
        parameter_code: 'PH',
        parameter_name: 'pH',
        data_type: ParameterDataType.PH,
        is_required: true,
        display_order: 20,
      },
      {
        parameter_code: 'NUMBER_OF_RINSES',
        parameter_name: 'Number of Rinses',
        data_type: ParameterDataType.INTEGER,
        is_required: true,
        display_order: 21,
        min_value: 2,
        max_value: 6,
      },
      {
        parameter_code: 'SOAPING',
        parameter_name: 'Soaping',
        data_type: ParameterDataType.TEXT,
        is_required: false,
        display_order: 22,
        help_text: 'Soap/detergent specification for soaping',
      },
      {
        parameter_code: 'NEUTRALISATION',
        parameter_name: 'Neutralisation',
        data_type: ParameterDataType.TEXT,
        is_required: false,
        display_order: 23,
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 24,
      },
      {
        parameter_code: 'REMARKS',
        parameter_name: 'Remarks',
        data_type: ParameterDataType.TEXT,
        is_required: false,
        display_order: 25,
      },
    ];

    for (const param of reactiveDyeingParams) {
      const existing = await parameterRepository.findOne({
        where: {
          process_id: reactiveDyeing.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });

      if (!existing) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: reactiveDyeing.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Reactive Dyeing (${reactiveDyeingParams.length} parameters)`);
  }


  // COLD WASH Parameters
  const coldWash = await getProcessByCode('WASH-COLD');
  if (coldWash) {
    const coldWashParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
        help_text: 'Select the washing machine',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 2,
        help_text: 'Weight of fabric at input',
      },
      {
        parameter_code: 'WATER_QUANTITY',
        parameter_name: 'Water Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'liters',
        is_required: true,
        display_order: 3,
        help_text: 'Quantity of water',
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 4,
        min_value: 5,
        max_value: 30,
        help_text: 'Cold wash temperature range 5-30°C',
      },
      {
        parameter_code: 'WASH_TIME',
        parameter_name: 'Wash Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 5,
        help_text: 'Total washing time',
      },
      {
        parameter_code: 'DETERGENT',
        parameter_name: 'Detergent',
        data_type: ParameterDataType.CHEMICAL,
        is_required: false,
        display_order: 6,
        help_text: 'Detergent type/name',
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 7,
        help_text: 'Weight of fabric at output',
      },
    ];

    for (const param of coldWashParams) {
      const existingParam = await parameterRepository.findOne({
        where: {
          process_id: coldWash.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });
      if (!existingParam) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: coldWash.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Cold Wash (${coldWashParams.length} parameters)`);
  }

  // BIO WASH Parameters
  const bioWash = await getProcessByCode('WASH-BIO');
  if (bioWash) {
    const bioWashParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
        help_text: 'Select the washing machine',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 2,
        help_text: 'Weight of fabric at input',
      },
      {
        parameter_code: 'ENZYME_TYPE',
        parameter_name: 'Enzyme Type',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 3,
        help_text: 'Type/name of enzyme used',
      },
      {
        parameter_code: 'ENZYME_DOSAGE',
        parameter_name: 'Enzyme Dosage',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 4,
        help_text: 'Amount of enzyme',
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 5,
        min_value: 20,
        max_value: 60,
        help_text: 'Bio-wash temperature',
      },
      {
        parameter_code: 'WASH_TIME',
        parameter_name: 'Wash Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 6,
        help_text: 'Bio-wash duration',
      },
      {
        parameter_code: 'PH',
        parameter_name: 'pH',
        data_type: ParameterDataType.PH,
        is_required: false,
        display_order: 7,
        min_value: 1,
        max_value: 14,
        help_text: 'pH of wash liquor',
      },
      {
        parameter_code: 'LIQUOR_RATIO',
        parameter_name: 'Liquor Ratio',
        data_type: ParameterDataType.DECIMAL,
        unit: '1:x',
        is_required: false,
        display_order: 8,
        help_text: 'Liquor ratio for bio-wash',
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 9,
        help_text: 'Weight of fabric at output',
      },
    ];

    for (const param of bioWashParams) {
      const existingParam = await parameterRepository.findOne({
        where: {
          process_id: bioWash.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });
      if (!existingParam) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: bioWash.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Bio Wash (${bioWashParams.length} parameters)`);
  }

  // STONE WASH Parameters
  const stoneWash = await getProcessByCode('WASH-STONE');
  if (stoneWash) {
    const stoneWashParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
        help_text: 'Select the washing machine',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 2,
        help_text: 'Weight of fabric at input',
      },
      {
        parameter_code: 'STONE_TYPE',
        parameter_name: 'Stone Type',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 3,
        help_text: 'Type of stone (pumice, lava, ceramic)',
      },
      {
        parameter_code: 'STONE_QUANTITY',
        parameter_name: 'Stone Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 4,
        help_text: 'Amount of stone to be used',
      },
      {
        parameter_code: 'STONE_FABRIC_RATIO',
        parameter_name: 'Stone to Fabric Ratio',
        data_type: ParameterDataType.DECIMAL,
        unit: '1:x',
        is_required: true,
        display_order: 5,
        help_text: 'Ratio of stone to fabric weight',
      },
      {
        parameter_code: 'WATER_QUANTITY',
        parameter_name: 'Water Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'liters',
        is_required: true,
        display_order: 6,
        help_text: 'Quantity of water',
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 7,
        min_value: 30,
        max_value: 60,
        help_text: 'Stone wash temperature',
      },
      {
        parameter_code: 'STONE_WASH_TIME',
        parameter_name: 'Stone Wash Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 8,
        help_text: 'Duration of stone washing',
      },
      {
        parameter_code: 'CHEMICAL',
        parameter_name: 'Chemical (Optional)',
        data_type: ParameterDataType.CHEMICAL,
        is_required: false,
        display_order: 9,
        help_text: 'Additional chemical used',
      },
      {
        parameter_code: 'CHEMICAL_DOSAGE',
        parameter_name: 'Chemical Dosage',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: false,
        display_order: 10,
        help_text: 'Dosage of additional chemical',
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 11,
        help_text: 'Weight of fabric at output',
      },
    ];

    for (const param of stoneWashParams) {
      const existingParam = await parameterRepository.findOne({
        where: {
          process_id: stoneWash.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });
      if (!existingParam) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: stoneWash.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Stone Wash (${stoneWashParams.length} parameters)`);
  }

  // STONE + ENZYME Parameters
  const stoneEnzyme = await getProcessByCode('WASH-STONE-ENZ');
  if (stoneEnzyme) {
    const stoneEnzymeParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
        help_text: 'Select the washing machine',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 2,
        help_text: 'Weight of fabric at input',
      },
      {
        parameter_code: 'STONE_TYPE',
        parameter_name: 'Stone Type',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 3,
        help_text: 'Type of stone used',
      },
      {
        parameter_code: 'STONE_QUANTITY',
        parameter_name: 'Stone Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 4,
        help_text: 'Amount of stone',
      },
      {
        parameter_code: 'STONE_FABRIC_RATIO',
        parameter_name: 'Stone to Fabric Ratio',
        data_type: ParameterDataType.DECIMAL,
        unit: '1:x',
        is_required: true,
        display_order: 5,
        help_text: 'Stone to fabric ratio',
      },
      {
        parameter_code: 'ENZYME_TYPE',
        parameter_name: 'Enzyme Type',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 6,
        help_text: 'Type of enzyme',
      },
      {
        parameter_code: 'ENZYME_DOSAGE',
        parameter_name: 'Enzyme Dosage',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 7,
        help_text: 'Amount of enzyme',
      },
      {
        parameter_code: 'WATER_QUANTITY',
        parameter_name: 'Water Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'liters',
        is_required: true,
        display_order: 8,
        help_text: 'Quantity of water',
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 9,
        min_value: 30,
        max_value: 70,
        help_text: 'Process temperature',
      },
      {
        parameter_code: 'PROCESS_TIME',
        parameter_name: 'Process Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 10,
        help_text: 'Total process time',
      },
      {
        parameter_code: 'PH',
        parameter_name: 'pH',
        data_type: ParameterDataType.PH,
        is_required: false,
        display_order: 11,
        min_value: 1,
        max_value: 14,
        help_text: 'pH of wash liquor',
      },
      {
        parameter_code: 'LIQUOR_RATIO',
        parameter_name: 'Liquor Ratio',
        data_type: ParameterDataType.DECIMAL,
        unit: '1:x',
        is_required: false,
        display_order: 12,
        help_text: 'Liquor ratio',
      },
      {
        parameter_code: 'NUMBER_OF_RINSES',
        parameter_name: 'Number of Rinses',
        data_type: ParameterDataType.INTEGER,
        is_required: false,
        display_order: 13,
        min_value: 1,
        max_value: 10,
        help_text: 'Number of rinses',
      },
      {
        parameter_code: 'NEUTRALISATION',
        parameter_name: 'Neutralisation Required',
        data_type: ParameterDataType.BOOLEAN,
        is_required: false,
        display_order: 14,
        help_text: 'Whether neutralisation is required',
      },
      {
        parameter_code: 'NEUTRALISING_AGENT',
        parameter_name: 'Neutralising Agent',
        data_type: ParameterDataType.CHEMICAL,
        is_required: false,
        display_order: 15,
        help_text: 'Type of neutralising agent used',
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 16,
        help_text: 'Weight of fabric at output',
      },
    ];

    for (const param of stoneEnzymeParams) {
      const existingParam = await parameterRepository.findOne({
        where: {
          process_id: stoneEnzyme.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });
      if (!existingParam) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: stoneEnzyme.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Stone + Enzyme Wash (${stoneEnzymeParams.length} parameters)`);
  }


  // ACID WASH Parameters
  const acidWash = await getProcessByCode('WASH-ACID');
  if (acidWash) {
    const acidWashParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
        help_text: 'Select the washing machine',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 2,
        help_text: 'Weight of fabric at input',
      },
      {
        parameter_code: 'ACID_SPECIFICATION',
        parameter_name: 'Acid/Oxidizing Agent Specification',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 3,
        help_text: 'Type/specification of acid or oxidizing agent',
      },
      {
        parameter_code: 'ACID_DOSAGE',
        parameter_name: 'Acid Dosage',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 4,
        help_text: 'Amount of acid or oxidizing agent',
      },
      {
        parameter_code: 'WATER_QUANTITY',
        parameter_name: 'Water Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'liters',
        is_required: true,
        display_order: 5,
        help_text: 'Quantity of water',
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 6,
        min_value: 20,
        max_value: 70,
        help_text: 'Acid wash temperature',
      },
      {
        parameter_code: 'TREATMENT_TIME',
        parameter_name: 'Treatment Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 7,
        help_text: 'Duration of acid treatment',
      },
      {
        parameter_code: 'PH',
        parameter_name: 'pH',
        data_type: ParameterDataType.PH,
        is_required: false,
        display_order: 8,
        min_value: 1,
        max_value: 14,
        help_text: 'pH of wash liquor',
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 9,
        help_text: 'Weight of fabric at output',
      },
    ];

    for (const param of acidWashParams) {
      const existingParam = await parameterRepository.findOne({
        where: {
          process_id: acidWash.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });
      if (!existingParam) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: acidWash.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Acid Wash (${acidWashParams.length} parameters)`);
  }

  // BLEACH WASH Parameters
  const bleachWash = await getProcessByCode('WASH-BLEACH');
  if (bleachWash) {
    const bleachWashParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
        help_text: 'Select the washing machine',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 2,
        help_text: 'Weight of fabric at input',
      },
      {
        parameter_code: 'BLEACHING_AGENT',
        parameter_name: 'Bleaching Agent',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 3,
        help_text: 'Type of bleaching agent (hydrogen peroxide, chlorine, etc)',
      },
      {
        parameter_code: 'BLEACH_DOSAGE',
        parameter_name: 'Bleach Dosage',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 4,
        help_text: 'Amount of bleaching agent',
      },
      {
        parameter_code: 'WATER_QUANTITY',
        parameter_name: 'Water Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'liters',
        is_required: true,
        display_order: 5,
        help_text: 'Quantity of water',
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 6,
        min_value: 30,
        max_value: 80,
        help_text: 'Bleach wash temperature',
      },
      {
        parameter_code: 'BLEACH_TIME',
        parameter_name: 'Bleach Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 7,
        help_text: 'Duration of bleaching',
      },
      {
        parameter_code: 'PH',
        parameter_name: 'pH',
        data_type: ParameterDataType.PH,
        is_required: false,
        display_order: 8,
        min_value: 1,
        max_value: 14,
        help_text: 'pH of wash liquor',
      },
      {
        parameter_code: 'NEUTRALISATION',
        parameter_name: 'Neutralisation Required',
        data_type: ParameterDataType.BOOLEAN,
        is_required: false,
        display_order: 9,
        help_text: 'Whether neutralisation is required',
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 10,
        help_text: 'Weight of fabric at output',
      },
    ];

    for (const param of bleachWashParams) {
      const existingParam = await parameterRepository.findOne({
        where: {
          process_id: bleachWash.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });
      if (!existingParam) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: bleachWash.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Bleach Wash (${bleachWashParams.length} parameters)`);
  }

  // PIGMENT WASH Parameters
  const pigmentWash = await getProcessByCode('WASH-PIGMENT');
  if (pigmentWash) {
    const pigmentWashParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
        help_text: 'Select the washing machine',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 2,
        help_text: 'Weight of fabric at input',
      },
      {
        parameter_code: 'PIGMENT_SPECIFICATION',
        parameter_name: 'Pigment Specification',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 3,
        help_text: 'Type/specification of pigment',
      },
      {
        parameter_code: 'BINDER_SPECIFICATION',
        parameter_name: 'Binder/Fixing Specification',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 4,
        help_text: 'Type of binder or fixing agent',
      },
      {
        parameter_code: 'DOSAGE',
        parameter_name: 'Total Dosage',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 5,
        help_text: 'Total dosage of pigment and binder',
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 6,
        min_value: 30,
        max_value: 80,
        help_text: 'Pigment wash temperature',
      },
      {
        parameter_code: 'TREATMENT_TIME',
        parameter_name: 'Treatment Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 7,
        help_text: 'Duration of pigment treatment',
      },
      {
        parameter_code: 'PH',
        parameter_name: 'pH',
        data_type: ParameterDataType.PH,
        is_required: false,
        display_order: 8,
        min_value: 1,
        max_value: 14,
        help_text: 'pH of wash liquor',
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 9,
        help_text: 'Weight of fabric at output',
      },
    ];

    for (const param of pigmentWashParams) {
      const existingParam = await parameterRepository.findOne({
        where: {
          process_id: pigmentWash.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });
      if (!existingParam) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: pigmentWash.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Pigment Wash (${pigmentWashParams.length} parameters)`);
  }

  // DENIM WASH Parameters (flexible, allows multiple treatments)
  const denimWash = await getProcessByCode('WASH-DENIM');
  if (denimWash) {
    const denimWashParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
        help_text: 'Select the washing machine',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 2,
        help_text: 'Weight of denim fabric at input',
      },
      {
        parameter_code: 'TREATMENT_SEQUENCE',
        parameter_name: 'Treatment Sequence',
        data_type: ParameterDataType.TEXT,
        is_required: true,
        display_order: 3,
        help_text: 'Sequence of treatments (e.g., Desizing → Stone → Enzyme → Bleach)',
      },
      {
        parameter_code: 'WATER_QUANTITY',
        parameter_name: 'Total Water Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'liters',
        is_required: true,
        display_order: 4,
        help_text: 'Total water quantity for all treatments',
      },
      {
        parameter_code: 'STONE_TYPE',
        parameter_name: 'Stone Type (if applicable)',
        data_type: ParameterDataType.CHEMICAL,
        is_required: false,
        display_order: 5,
        help_text: 'Type of stone used in stone wash',
      },
      {
        parameter_code: 'STONE_QUANTITY',
        parameter_name: 'Stone Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: false,
        display_order: 6,
        help_text: 'Amount of stone used',
      },
      {
        parameter_code: 'ENZYME_TYPE',
        parameter_name: 'Enzyme Type (if applicable)',
        data_type: ParameterDataType.CHEMICAL,
        is_required: false,
        display_order: 7,
        help_text: 'Type of enzyme used',
      },
      {
        parameter_code: 'ENZYME_DOSAGE',
        parameter_name: 'Enzyme Dosage',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: false,
        display_order: 8,
        help_text: 'Amount of enzyme',
      },
      {
        parameter_code: 'BLEACHING_AGENT',
        parameter_name: 'Bleaching Agent (if applicable)',
        data_type: ParameterDataType.CHEMICAL,
        is_required: false,
        display_order: 9,
        help_text: 'Type of bleaching agent',
      },
      {
        parameter_code: 'SOFTENER',
        parameter_name: 'Softener Applied',
        data_type: ParameterDataType.BOOLEAN,
        is_required: false,
        display_order: 10,
        help_text: 'Whether softener was applied',
      },
      {
        parameter_code: 'NEUTRALISATION',
        parameter_name: 'Neutralisation Applied',
        data_type: ParameterDataType.BOOLEAN,
        is_required: false,
        display_order: 11,
        help_text: 'Whether neutralisation was applied',
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 12,
        help_text: 'Weight of denim fabric at output',
      },
    ];

    for (const param of denimWashParams) {
      const existingParam = await parameterRepository.findOne({
        where: {
          process_id: denimWash.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });
      if (!existingParam) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: denimWash.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Denim Wash (${denimWashParams.length} parameters)`);
  }


  // ============= DYEING PROCESSES =============

  // DISPERSE DYEING Parameters
  const disperseDyeing = await getProcessByCode('DYE-DISPERSE');
  if (disperseDyeing) {
    const disperseDyeingParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
        help_text: 'Select the dyeing machine',
      },
      {
        parameter_code: 'BATCH_NUMBER',
        parameter_name: 'Batch Number',
        data_type: ParameterDataType.TEXT,
        is_required: true,
        display_order: 2,
        help_text: 'Unique batch identifier',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 3,
        help_text: 'Weight of fabric at input',
      },
      {
        parameter_code: 'FABRIC_TYPE',
        parameter_name: 'Fabric Type',
        data_type: ParameterDataType.TEXT,
        is_required: true,
        display_order: 4,
        help_text: 'Type of fabric being dyed',
      },
      {
        parameter_code: 'COLOUR',
        parameter_name: 'Colour',
        data_type: ParameterDataType.COLOUR,
        is_required: true,
        display_order: 5,
        help_text: 'Target colour',
      },
      {
        parameter_code: 'SHADE_CODE',
        parameter_name: 'Shade Code',
        data_type: ParameterDataType.SHADE,
        is_required: true,
        display_order: 6,
        help_text: 'Shade code for colour matching',
      },
      {
        parameter_code: 'RECIPE',
        parameter_name: 'Recipe',
        data_type: ParameterDataType.RECIPE,
        is_required: true,
        display_order: 7,
        help_text: 'Dyeing recipe reference',
      },
      {
        parameter_code: 'LIQUOR_RATIO',
        parameter_name: 'Liquor Ratio',
        data_type: ParameterDataType.DECIMAL,
        unit: '1:x',
        is_required: true,
        display_order: 8,
        help_text: 'Liquor ratio for dyeing',
      },
      {
        parameter_code: 'DYE',
        parameter_name: 'Dye',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 9,
        help_text: 'Type/name of disperse dye',
      },
      {
        parameter_code: 'DYE_QUANTITY',
        parameter_name: 'Dye Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 10,
        help_text: 'Amount of dye',
      },
      {
        parameter_code: 'DISPERSING_AGENT',
        parameter_name: 'Dispersing Agent',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 11,
        help_text: 'Type of dispersing agent',
      },
      {
        parameter_code: 'DISPERSING_DOSAGE',
        parameter_name: 'Dispersing Agent Dosage',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 12,
        help_text: 'Amount of dispersing agent',
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 13,
        min_value: 80,
        max_value: 140,
        help_text: 'Dyeing temperature',
      },
      {
        parameter_code: 'HEATING_RATE',
        parameter_name: 'Heating Rate',
        data_type: ParameterDataType.QUANTITY,
        unit: '°C/min',
        is_required: false,
        display_order: 14,
        help_text: 'Rate of temperature increase',
      },
      {
        parameter_code: 'HOLDING_TIME',
        parameter_name: 'Holding Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 15,
        help_text: 'Time to hold at dyeing temperature',
      },
      {
        parameter_code: 'PH',
        parameter_name: 'pH',
        data_type: ParameterDataType.PH,
        is_required: false,
        display_order: 16,
        min_value: 1,
        max_value: 14,
        help_text: 'pH of dyeing liquor',
      },
      {
        parameter_code: 'REDUCTION_CLEARING',
        parameter_name: 'Reduction Clearing (if applicable)',
        data_type: ParameterDataType.TEXT,
        is_required: false,
        display_order: 17,
        help_text: 'Reduction clearing details if needed',
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 18,
        help_text: 'Weight of fabric at output',
      },
    ];

    for (const param of disperseDyeingParams) {
      const existingParam = await parameterRepository.findOne({
        where: {
          process_id: disperseDyeing.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });
      if (!existingParam) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: disperseDyeing.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Disperse Dyeing (${disperseDyeingParams.length} parameters)`);
  }

  // PIGMENT DYEING Parameters
  const pigmentDyeing = await getProcessByCode('DYE-PIGMENT');
  if (pigmentDyeing) {
    const pigmentDyeingParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
        help_text: 'Select the dyeing machine',
      },
      {
        parameter_code: 'BATCH_NUMBER',
        parameter_name: 'Batch Number',
        data_type: ParameterDataType.TEXT,
        is_required: true,
        display_order: 2,
        help_text: 'Unique batch identifier',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 3,
        help_text: 'Weight of fabric at input',
      },
      {
        parameter_code: 'COLOUR',
        parameter_name: 'Colour',
        data_type: ParameterDataType.COLOUR,
        is_required: true,
        display_order: 4,
        help_text: 'Target colour',
      },
      {
        parameter_code: 'SHADE_CODE',
        parameter_name: 'Shade Code',
        data_type: ParameterDataType.SHADE,
        is_required: true,
        display_order: 5,
        help_text: 'Shade code for colour matching',
      },
      {
        parameter_code: 'PIGMENT',
        parameter_name: 'Pigment',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 6,
        help_text: 'Type/name of pigment',
      },
      {
        parameter_code: 'PIGMENT_QUANTITY',
        parameter_name: 'Pigment Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 7,
        help_text: 'Amount of pigment',
      },
      {
        parameter_code: 'BINDER',
        parameter_name: 'Binder',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 8,
        help_text: 'Type of binder',
      },
      {
        parameter_code: 'BINDER_QUANTITY',
        parameter_name: 'Binder Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 9,
        help_text: 'Amount of binder',
      },
      {
        parameter_code: 'FIXING_INFORMATION',
        parameter_name: 'Fixing/Curing Information',
        data_type: ParameterDataType.TEXT,
        is_required: false,
        display_order: 10,
        help_text: 'Fixing and curing process details',
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 11,
        min_value: 50,
        max_value: 100,
        help_text: 'Process temperature',
      },
      {
        parameter_code: 'TREATMENT_TIME',
        parameter_name: 'Treatment Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 12,
        help_text: 'Duration of treatment',
      },
      {
        parameter_code: 'PH',
        parameter_name: 'pH',
        data_type: ParameterDataType.PH,
        is_required: false,
        display_order: 13,
        min_value: 1,
        max_value: 14,
        help_text: 'pH of liquor',
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 14,
        help_text: 'Weight of fabric at output',
      },
    ];

    for (const param of pigmentDyeingParams) {
      const existingParam = await parameterRepository.findOne({
        where: {
          process_id: pigmentDyeing.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });
      if (!existingParam) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: pigmentDyeing.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Pigment Dyeing (${pigmentDyeingParams.length} parameters)`);
  }

  // DIRECT DYEING Parameters
  const directDyeing = await getProcessByCode('DYE-DIRECT');
  if (directDyeing) {
    const directDyeingParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
        help_text: 'Select the dyeing machine',
      },
      {
        parameter_code: 'BATCH_NUMBER',
        parameter_name: 'Batch Number',
        data_type: ParameterDataType.TEXT,
        is_required: true,
        display_order: 2,
        help_text: 'Unique batch identifier',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 3,
        help_text: 'Weight of fabric at input',
      },
      {
        parameter_code: 'RECIPE',
        parameter_name: 'Recipe',
        data_type: ParameterDataType.RECIPE,
        is_required: true,
        display_order: 4,
        help_text: 'Dyeing recipe reference',
      },
      {
        parameter_code: 'DYE',
        parameter_name: 'Dye',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 5,
        help_text: 'Type/name of direct dye',
      },
      {
        parameter_code: 'DYE_QUANTITY',
        parameter_name: 'Dye Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 6,
        help_text: 'Amount of dye',
      },
      {
        parameter_code: 'SALT_QUANTITY',
        parameter_name: 'Salt Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 7,
        help_text: 'Amount of salt (if required)',
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 8,
        min_value: 60,
        max_value: 100,
        help_text: 'Dyeing temperature',
      },
      {
        parameter_code: 'DYEING_TIME',
        parameter_name: 'Dyeing Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 9,
        help_text: 'Duration of dyeing',
      },
      {
        parameter_code: 'PH',
        parameter_name: 'pH',
        data_type: ParameterDataType.PH,
        is_required: false,
        display_order: 10,
        min_value: 1,
        max_value: 14,
        help_text: 'pH of dyeing liquor',
      },
      {
        parameter_code: 'LIQUOR_RATIO',
        parameter_name: 'Liquor Ratio',
        data_type: ParameterDataType.DECIMAL,
        unit: '1:x',
        is_required: true,
        display_order: 11,
        help_text: 'Liquor ratio for dyeing',
      },
      {
        parameter_code: 'NUMBER_OF_RINSES',
        parameter_name: 'Number of Rinses',
        data_type: ParameterDataType.INTEGER,
        is_required: false,
        display_order: 12,
        min_value: 1,
        max_value: 10,
        help_text: 'Number of rinses after dyeing',
      },
      {
        parameter_code: 'SOAPING',
        parameter_name: 'Soaping Required',
        data_type: ParameterDataType.BOOLEAN,
        is_required: false,
        display_order: 13,
        help_text: 'Whether soaping is required',
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 14,
        help_text: 'Weight of fabric at output',
      },
    ];

    for (const param of directDyeingParams) {
      const existingParam = await parameterRepository.findOne({
        where: {
          process_id: directDyeing.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });
      if (!existingParam) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: directDyeing.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Direct Dyeing (${directDyeingParams.length} parameters)`);
  }

  // VAT DYEING Parameters
  const vatDyeing = await getProcessByCode('DYE-VAT');
  if (vatDyeing) {
    const vatDyeingParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
        help_text: 'Select the dyeing machine',
      },
      {
        parameter_code: 'BATCH_NUMBER',
        parameter_name: 'Batch Number',
        data_type: ParameterDataType.TEXT,
        is_required: true,
        display_order: 2,
        help_text: 'Unique batch identifier',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 3,
        help_text: 'Weight of fabric at input',
      },
      {
        parameter_code: 'RECIPE',
        parameter_name: 'Recipe',
        data_type: ParameterDataType.RECIPE,
        is_required: true,
        display_order: 4,
        help_text: 'Vat dyeing recipe reference',
      },
      {
        parameter_code: 'DYE',
        parameter_name: 'Vat Dye',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 5,
        help_text: 'Type/name of vat dye',
      },
      {
        parameter_code: 'DYE_QUANTITY',
        parameter_name: 'Dye Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 6,
        help_text: 'Amount of vat dye',
      },
      {
        parameter_code: 'REDUCING_SYSTEM',
        parameter_name: 'Reducing System',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 7,
        help_text: 'Type of reducing agent system',
      },
      {
        parameter_code: 'REDUCING_AGENT_DOSAGE',
        parameter_name: 'Reducing Agent Dosage',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 8,
        help_text: 'Amount of reducing agent',
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 9,
        min_value: 50,
        max_value: 100,
        help_text: 'Dyeing temperature',
      },
      {
        parameter_code: 'DYEING_TIME',
        parameter_name: 'Dyeing Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 10,
        help_text: 'Duration of vat dyeing',
      },
      {
        parameter_code: 'PH',
        parameter_name: 'pH',
        data_type: ParameterDataType.PH,
        is_required: false,
        display_order: 11,
        min_value: 1,
        max_value: 14,
        help_text: 'pH of dyeing liquor',
      },
      {
        parameter_code: 'LIQUOR_RATIO',
        parameter_name: 'Liquor Ratio',
        data_type: ParameterDataType.DECIMAL,
        unit: '1:x',
        is_required: true,
        display_order: 12,
        help_text: 'Liquor ratio for dyeing',
      },
      {
        parameter_code: 'OXIDATION_INFO',
        parameter_name: 'Oxidation Information',
        data_type: ParameterDataType.TEXT,
        is_required: false,
        display_order: 13,
        help_text: 'Oxidation process details (if applicable)',
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 14,
        help_text: 'Weight of fabric at output',
      },
    ];

    for (const param of vatDyeingParams) {
      const existingParam = await parameterRepository.findOne({
        where: {
          process_id: vatDyeing.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });
      if (!existingParam) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: vatDyeing.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Vat Dyeing (${vatDyeingParams.length} parameters)`);
  }

  // SULPHUR DYEING Parameters
  const sulphurDyeing = await getProcessByCode('DYE-SULPHUR');
  if (sulphurDyeing) {
    const sulphurDyeingParams = [
      {
        parameter_code: 'MACHINE',
        parameter_name: 'Machine',
        data_type: ParameterDataType.MACHINE,
        is_required: true,
        display_order: 1,
        help_text: 'Select the dyeing machine',
      },
      {
        parameter_code: 'BATCH_NUMBER',
        parameter_name: 'Batch Number',
        data_type: ParameterDataType.TEXT,
        is_required: true,
        display_order: 2,
        help_text: 'Unique batch identifier',
      },
      {
        parameter_code: 'INPUT_QUANTITY',
        parameter_name: 'Input Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 3,
        help_text: 'Weight of fabric at input',
      },
      {
        parameter_code: 'COLOUR',
        parameter_name: 'Colour',
        data_type: ParameterDataType.COLOUR,
        is_required: true,
        display_order: 4,
        help_text: 'Target colour',
      },
      {
        parameter_code: 'RECIPE',
        parameter_name: 'Recipe',
        data_type: ParameterDataType.RECIPE,
        is_required: true,
        display_order: 5,
        help_text: 'Sulphur dyeing recipe reference',
      },
      {
        parameter_code: 'SULPHUR_DYE',
        parameter_name: 'Sulphur Dye',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 6,
        help_text: 'Type/name of sulphur dye',
      },
      {
        parameter_code: 'SULPHUR_DYE_QUANTITY',
        parameter_name: 'Sulphur Dye Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 7,
        help_text: 'Amount of sulphur dye',
      },
      {
        parameter_code: 'REDUCING_SYSTEM',
        parameter_name: 'Reducing System',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 8,
        help_text: 'Type of reducing system',
      },
      {
        parameter_code: 'REDUCING_AGENT_DOSAGE',
        parameter_name: 'Reducing Agent Dosage',
        data_type: ParameterDataType.QUANTITY,
        unit: 'grams',
        is_required: true,
        display_order: 9,
        help_text: 'Amount of reducing agent',
      },
      {
        parameter_code: 'TEMPERATURE',
        parameter_name: 'Temperature',
        data_type: ParameterDataType.TEMPERATURE,
        unit: '°C',
        is_required: true,
        display_order: 10,
        min_value: 60,
        max_value: 120,
        help_text: 'Sulphur dyeing temperature',
      },
      {
        parameter_code: 'DYEING_TIME',
        parameter_name: 'Dyeing Time',
        data_type: ParameterDataType.DURATION,
        unit: 'minutes',
        is_required: true,
        display_order: 11,
        help_text: 'Duration of sulphur dyeing',
      },
      {
        parameter_code: 'OXIDATION_SYSTEM',
        parameter_name: 'Oxidation System',
        data_type: ParameterDataType.CHEMICAL,
        is_required: true,
        display_order: 12,
        help_text: 'Type of oxidation system',
      },
      {
        parameter_code: 'PH',
        parameter_name: 'pH',
        data_type: ParameterDataType.PH,
        is_required: false,
        display_order: 13,
        min_value: 1,
        max_value: 14,
        help_text: 'pH of dyeing liquor',
      },
      {
        parameter_code: 'OUTPUT_QUANTITY',
        parameter_name: 'Output Quantity',
        data_type: ParameterDataType.QUANTITY,
        unit: 'kg',
        is_required: true,
        display_order: 14,
        help_text: 'Weight of fabric at output',
      },
    ];

    for (const param of sulphurDyeingParams) {
      const existingParam = await parameterRepository.findOne({
        where: {
          process_id: sulphurDyeing.id,
          parameter_code: param.parameter_code,
          factory_id: null,
        },
      });
      if (!existingParam) {
        const newParam = parameterRepository.create({
          ...param,
          process_id: sulphurDyeing.id,
          factory_id: null,
        });
        await parameterRepository.save(newParam);
      }
    }
    console.log(`  ✓ Sulphur Dyeing (${sulphurDyeingParams.length} parameters)`);
  }


  console.log('\n✓ Process Parameters seeding complete!');
};
