import { ProcessCategory } from '../process-master/process-category.entity';
import { Process } from '../process-master/process.entity';
import { DataSource } from 'typeorm';

export const seedProcessMaster = async (dataSource: DataSource) => {
  const categoryRepository = dataSource.getRepository(ProcessCategory);
  const processRepository = dataSource.getRepository(Process);

  // Define all process categories
  const categories = [
    {
      name: 'Pre-Treatment',
      code: 'PRE',
      description: 'Pre-treatment processes for fabric preparation',
      display_order: 1,
    },
    {
      name: 'Washing',
      code: 'WASH',
      description: 'Washing and cleaning processes',
      display_order: 2,
    },
    {
      name: 'Dyeing',
      code: 'DYE',
      description: 'Dyeing processes with various techniques',
      display_order: 3,
    },
    {
      name: 'Finishing',
      code: 'FIN',
      description: 'Finishing processes to enhance fabric properties',
      display_order: 4,
    },
    {
      name: 'Drying / Water Removal',
      code: 'DRY',
      description: 'Drying and water removal processes',
      display_order: 5,
    },
    {
      name: 'Special Treatments',
      code: 'SPEC',
      description: 'Special treatment processes',
      display_order: 6,
    },
  ];

  // Define all processes organized by category
  const processes = {
    PRE: [
      {
        name: 'Desizing',
        code: 'PRE-DESZ',
        description: 'Removal of sizing agents from fabric',
        process_family: 'Chemical',
        process_type: 'Pre-treatment',
      },
      {
        name: 'Scouring',
        code: 'PRE-SCOUR',
        description: 'Removal of impurities and oils',
        process_family: 'Chemical',
        process_type: 'Pre-treatment',
      },
      {
        name: 'Bleaching',
        code: 'PRE-BLEACH',
        description: 'Whitening of fabric fibers',
        process_family: 'Chemical',
        process_type: 'Pre-treatment',
      },
      {
        name: 'RFD (Ready For Dyeing)',
        code: 'PRE-RFD',
        description: 'Final preparation stage before dyeing',
        process_family: 'Chemical',
        process_type: 'Pre-treatment',
      },
    ],
    WASH: [
      {
        name: 'Normal Wash',
        code: 'WASH-NORM',
        description: 'Standard washing process',
        process_family: 'Wash',
        process_type: 'Chemical',
      },
      {
        name: 'Rinse Wash',
        code: 'WASH-RINSE',
        description: 'Light rinse to remove excess materials',
        process_family: 'Wash',
        process_type: 'Chemical',
      },
      {
        name: 'Hot Wash',
        code: 'WASH-HOT',
        description: 'High temperature washing',
        process_family: 'Wash',
        process_type: 'Thermal',
      },
      {
        name: 'Cold Wash',
        code: 'WASH-COLD',
        description: 'Low temperature washing for delicate fabrics',
        process_family: 'Wash',
        process_type: 'Chemical',
      },
      {
        name: 'Enzyme Wash',
        code: 'WASH-ENZ',
        description: 'Washing using enzyme treatment',
        process_family: 'Wash',
        process_type: 'Chemical',
      },
      {
        name: 'Bio Wash',
        code: 'WASH-BIO',
        description: 'Biological enzyme-based washing',
        process_family: 'Wash',
        process_type: 'Chemical',
      },
      {
        name: 'Stone Wash',
        code: 'WASH-STONE',
        description: 'Vintage effect using stone abrasion',
        process_family: 'Wash',
        process_type: 'Mechanical',
      },
      {
        name: 'Stone + Enzyme',
        code: 'WASH-STONE-ENZ',
        description: 'Combined stone and enzyme washing',
        process_family: 'Wash',
        process_type: 'Mechanical',
      },
      {
        name: 'Acid Wash',
        code: 'WASH-ACID',
        description: 'Washing using acidic treatment',
        process_family: 'Wash',
        process_type: 'Chemical',
      },
      {
        name: 'Bleach Wash',
        code: 'WASH-BLEACH',
        description: 'Washing with bleaching agent',
        process_family: 'Wash',
        process_type: 'Chemical',
      },
      {
        name: 'Pigment Wash',
        code: 'WASH-PIGMENT',
        description: 'Washing with pigment treatment',
        process_family: 'Wash',
        process_type: 'Chemical',
      },
      {
        name: 'Denim Wash',
        code: 'WASH-DENIM',
        description: 'Specialized washing for denim fabrics',
        process_family: 'Wash',
        process_type: 'Chemical',
      },
    ],
    DYE: [
      {
        name: 'Reactive Dyeing',
        code: 'DYE-REACTIVE',
        description: 'Reactive dyes that chemically bond to fibers',
        process_family: 'Dye',
        process_type: 'Chemical',
      },
      {
        name: 'Disperse Dyeing',
        code: 'DYE-DISPERSE',
        description: 'Dyeing with disperse dyes for synthetic fibers',
        process_family: 'Dye',
        process_type: 'Chemical',
      },
      {
        name: 'Pigment Dyeing',
        code: 'DYE-PIGMENT',
        description: 'Dyeing using pigment particles',
        process_family: 'Dye',
        process_type: 'Chemical',
      },
      {
        name: 'Direct Dyeing',
        code: 'DYE-DIRECT',
        description: 'Direct dyes applied directly to fabric',
        process_family: 'Dye',
        process_type: 'Chemical',
      },
      {
        name: 'Vat Dyeing',
        code: 'DYE-VAT',
        description: 'Vat dyes with high fastness properties',
        process_family: 'Dye',
        process_type: 'Chemical',
      },
      {
        name: 'Sulphur Dyeing',
        code: 'DYE-SULPHUR',
        description: 'Sulphur-based dyeing for cellulosic fibers',
        process_family: 'Dye',
        process_type: 'Chemical',
      },
      {
        name: 'Other Dyeing',
        code: 'DYE-OTHER',
        description: 'Other specialized dyeing methods',
        process_family: 'Dye',
        process_type: 'Chemical',
      },
    ],
    FIN: [
      {
        name: 'Softener',
        code: 'FIN-SOFT',
        description: 'Standard softening treatment',
        process_family: 'Finish',
        process_type: 'Chemical',
      },
      {
        name: 'Silicon Softener',
        code: 'FIN-SILICON',
        description: 'Silicone-based softening for enhanced feel',
        process_family: 'Finish',
        process_type: 'Chemical',
      },
      {
        name: 'Stenter',
        code: 'FIN-STENTER',
        description: 'Stentering to set width and remove wrinkles',
        process_family: 'Finish',
        process_type: 'Thermal',
      },
      {
        name: 'Compacting',
        code: 'FIN-COMPACT',
        description: 'Mechanical compacting for density',
        process_family: 'Finish',
        process_type: 'Mechanical',
      },
      {
        name: 'Sanforizing',
        code: 'FIN-SANFOR',
        description: 'Shrinkage control treatment',
        process_family: 'Finish',
        process_type: 'Mechanical',
      },
      {
        name: 'Calendaring',
        code: 'FIN-CALEND',
        description: 'Pressing for smooth finish and sheen',
        process_family: 'Finish',
        process_type: 'Mechanical',
      },
      {
        name: 'Brushing',
        code: 'FIN-BRUSH',
        description: 'Brushing to raise fiber ends for texture',
        process_family: 'Finish',
        process_type: 'Mechanical',
      },
      {
        name: 'Anti-Pilling',
        code: 'FIN-ANTIPILL',
        description: 'Treatment to prevent pilling',
        process_family: 'Finish',
        process_type: 'Chemical',
      },
    ],
    DRY: [
      {
        name: 'Hydro Extraction',
        code: 'DRY-HYDRO',
        description: 'Centrifugal extraction of water',
        process_family: 'Dry',
        process_type: 'Mechanical',
      },
      {
        name: 'Tumble Dry',
        code: 'DRY-TUMBLE',
        description: 'Heated drum drying',
        process_family: 'Dry',
        process_type: 'Thermal',
      },
      {
        name: 'Natural Dry',
        code: 'DRY-NATURAL',
        description: 'Air drying under natural conditions',
        process_family: 'Dry',
        process_type: 'Thermal',
      },
    ],
    SPEC: [
      {
        name: 'Fixing',
        code: 'SPEC-FIX',
        description: 'Process to fix colors and treatments',
        process_family: 'Special',
        process_type: 'Chemical',
      },
      {
        name: 'Water Absorbency',
        code: 'SPEC-ABSORB',
        description: 'Treatment to enhance water absorbency',
        process_family: 'Special',
        process_type: 'Chemical',
      },
      {
        name: 'Antimicrobial',
        code: 'SPEC-ANTIMICRO',
        description: 'Treatment for antimicrobial properties',
        process_family: 'Special',
        process_type: 'Chemical',
      },
      {
        name: 'Other Special Treatments',
        code: 'SPEC-OTHER',
        description: 'Other specialized fabric treatments',
        process_family: 'Special',
        process_type: 'Chemical',
      },
    ],
  };

  // Seed categories
  const savedCategories = {};

  for (const cat of categories) {
    const existing = await categoryRepository.findOne({
      where: { code: cat.code },
    });

    if (!existing) {
      const category = categoryRepository.create({
        ...cat,
        is_system_default: true,
      });
      const saved = await categoryRepository.save(category);
      savedCategories[cat.code] = saved;
      console.log(`✓ Created category: ${cat.name}`);
    } else {
      savedCategories[cat.code] = existing;
      console.log(`✓ Category already exists: ${cat.name}`);
    }
  }

  // Seed processes
  let processOrder = 1;
  for (const [categoryCode, categoryProcesses] of Object.entries(processes)) {
    const category = savedCategories[categoryCode];

    for (const proc of categoryProcesses) {
      const existing = await processRepository.findOne({
        where: { process_code: proc.code },
      });

      if (!existing) {
        const process = processRepository.create({
          category_id: category.id,
          name: proc.name,
          process_code: proc.code,
          description: proc.description,
          process_family: proc.process_family,
          process_type: proc.process_type,
          is_system_default: true,
          display_order: processOrder++,
        });
        await processRepository.save(process);
        console.log(`  ✓ Created process: ${proc.name} (${proc.code})`);
      } else {
        console.log(`  ✓ Process already exists: ${proc.name} (${proc.code})`);
      }
    }
  }

  console.log('\n✓ Process Master seeding complete!');
};
