import type { ExpansionPack } from '../types';
import { theBlackPlague } from './cards/175';
import { blackPlague } from './cards/176';
import { treatment } from './cards/177';
import { quarantineCard } from './cards/178';
import { rats } from './cards/179';
import { sewer } from './cards/182';
import { contamination } from './cards/183';
import { invasion } from './cards/189';
import { siegeTower } from './cards/190';
import { enemyArcher } from './cards/191';
import { enemyTroop } from './cards/192';
import { infiltrator } from './cards/194';
import { enemyPrince } from './cards/195';
import { enemyCommander } from './cards/196';
import { enemySpearman } from './cards/198';
import { cityAblaze } from './cards/200';
import { naturesRevenge } from './cards/203';
import { weatherMage } from './cards/204';
import { jaguar } from './cards/205';
import { cursedLands } from './cards/206';
import { badOmen } from './cards/207';
import { thunderstorm } from './cards/208';
import { volcanicEruption } from './cards/209';
import { cityFire } from './cards/210';
import { ratsFamine } from './cards/211';
import { hurricane } from './cards/212';
import { bearCub } from './cards/213';
import { drought } from './cards/214';
import { earthquake } from './cards/215';
import { lightningStrike } from './cards/217';
import { scienceCover } from './cards/218';
import { scienceTrack } from './cards/219';
import { laughingStock } from './cards/220';
import { obsession } from './cards/221';
import { school49 } from './cards/222';
import { monastery50 } from './cards/223';
import { monastery51 } from './cards/224';
import { curiousBoy } from './cards/225';
import { curiousGirl } from './cards/226';
import { student } from './cards/227';
import { university } from './cards/231';
import { experiments } from './cards/232';
import { metallurgy } from './cards/233';
import { aerostats } from './cards/234';
import { stoneRoads } from './cards/235';
import { appliedScience } from './cards/236';
import { churchCover } from './cards/237';
import { skepticism } from './cards/238';
import { percival } from './cards/239';
import { churchBells } from './cards/240';
import { pilgrim } from './cards/241';
import { overgrownChapel } from './cards/242';
import { mountainConstruction } from './cards/243';
import { archbishops } from './cards/244';
import { archbishop } from './cards/245';
import { monastery75 } from './cards/248';
import { school76 } from './cards/249';
import { mysticScholar } from './cards/250';
import { pilgrimage } from './cards/253';
import { newForest } from './cards/254';
import { churchAuthority } from './cards/255';
import { newParadigm } from './cards/256';
import { experiment84 } from './cards/257';
import { printingPress } from './cards/259';
import { theologyOfScience } from './cards/260';
import { romanceCover } from './cards/261';
import { arthur } from './cards/262';
import { virtues } from './cards/263';
import { damselInDistress } from './cards/264';
import { gawain } from './cards/265';
import { endurance } from './cards/266';
import { duel } from './cards/267';
import { court } from './cards/268';
import { lancelot } from './cards/269';
import { godfrey } from './cards/270';
import { roundTable } from './cards/271';
import { diana } from './cards/272';
import { seraphine } from './cards/273';
import { isolde } from './cards/274';
import { aleta } from './cards/275';
import { guinevere } from './cards/276';
import { andoniel } from './cards/277';
import { chivalry } from './cards/278';
import { artisansCover } from './cards/279';
import { modernArt } from './cards/280';
import { statues } from './cards/281';
import { mosaics } from './cards/282';
import { spinningWheel } from './cards/283';
import { dreamer } from './cards/284';
import { glassblower } from './cards/285';
import { sirTristan } from './cards/286';
import { youngPainter } from './cards/287';
import { glassWindows } from './cards/288';
import { goldenPillar } from './cards/289';
import { pillarHall } from './cards/293';
import { ring } from './cards/294';
import { necklace } from './cards/295';
import { noblesCover } from './cards/296';
import { corruption } from './cards/297';
import { nobleHouses } from './cards/298';
import { valiantPrince } from './cards/299';
import { idealServant } from './cards/300';
import { craftsman } from './cards/301';
import { steward } from './cards/302';
import { chaliceOfMalice } from './cards/303';
import { lordEdric } from './cards/304';
import { countessAriadne } from './cards/305';
import { earlAlistair } from './cards/306';
import { viscountEemon } from './cards/307';
import { baronArion } from './cards/308';
import { baronRoderick } from './cards/309';
import { ladyElara } from './cards/310';
import { wealthContest } from './cards/311';
import { growHouses } from './cards/312';
import { mechanicsCover } from './cards/313';
import { sirBeaufort } from './cards/314';
import { tinker } from './cards/315';
import { workshop } from './cards/316';
import { irrigation } from './cards/317';
import { wheelbarrow } from './cards/318';
import { stagePreparations } from './cards/319';
import { holeInTheRoof } from './cards/320';
import { breakthrough } from './cards/321';
import { brainstorming } from './cards/322';
import { rust } from './cards/323';
import { hydraulics } from './cards/324';
import { wagon } from './cards/325';
import { craneConstruction } from './cards/326';
import { siegeEngine } from './cards/327';
import { calculations } from './cards/328';
import { childrensToy } from './cards/329';
import deck from './deck.json';
import en from './locales/cards.en.json';
import fr from './locales/cards.fr.json';

export const foundations: ExpansionPack = {
  locales: { en, fr },
  deck: deck as ExpansionPack['deck'], // JSON strings → enums
  cards: [
    theBlackPlague,
    blackPlague,
    treatment,
    quarantineCard,
    rats,
    sewer,
    contamination,
    invasion,
    siegeTower,
    enemyArcher,
    enemyTroop,
    infiltrator,
    enemyPrince,
    enemyCommander,
    enemySpearman,
    cityAblaze,
    naturesRevenge,
    weatherMage,
    jaguar,
    cursedLands,
    badOmen,
    thunderstorm,
    volcanicEruption,
    cityFire,
    ratsFamine,
    hurricane,
    bearCub,
    drought,
    earthquake,
    lightningStrike,
    scienceCover,
    scienceTrack,
    laughingStock,
    obsession,
    school49,
    monastery50,
    monastery51,
    curiousBoy,
    curiousGirl,
    student,
    university,
    experiments,
    metallurgy,
    aerostats,
    stoneRoads,
    appliedScience,
    churchCover,
    skepticism,
    percival,
    churchBells,
    pilgrim,
    overgrownChapel,
    mountainConstruction,
    archbishops,
    archbishop,
    monastery75,
    school76,
    mysticScholar,
    pilgrimage,
    newForest,
    churchAuthority,
    newParadigm,
    experiment84,
    printingPress,
    theologyOfScience,
    romanceCover,
    arthur,
    virtues,
    damselInDistress,
    gawain,
    endurance,
    duel,
    court,
    lancelot,
    godfrey,
    roundTable,
    diana,
    seraphine,
    isolde,
    aleta,
    guinevere,
    andoniel,
    chivalry,
    artisansCover,
    modernArt,
    statues,
    mosaics,
    spinningWheel,
    dreamer,
    glassblower,
    sirTristan,
    youngPainter,
    glassWindows,
    goldenPillar,
    pillarHall,
    ring,
    necklace,
    noblesCover,
    corruption,
    nobleHouses,
    valiantPrince,
    idealServant,
    craftsman,
    steward,
    chaliceOfMalice,
    lordEdric,
    countessAriadne,
    earlAlistair,
    viscountEemon,
    baronArion,
    baronRoderick,
    ladyElara,
    wealthContest,
    growHouses,
    mechanicsCover,
    sirBeaufort,
    tinker,
    workshop,
    irrigation,
    wheelbarrow,
    stagePreparations,
    holeInTheRoof,
    breakthrough,
    brainstorming,
    rust,
    hydraulics,
    wagon,
    craneConstruction,
    siegeEngine,
    calculations,
    childrensToy,
  ],
};
