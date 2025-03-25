import React, { useState } from 'react';

// Define types for our state
type AnswerOption = 'yes' | 'no' | 'doubt' | 'not_enough_information' | null;

interface AnswersState {
  interventionDeath: AnswerOption;
  interventionForLC: AnswerOption;
  metastasisEvidence: AnswerOption;
  tumorEvidence: AnswerOption;
  paraneoplasticEvidence: AnswerOption;
  clearCauseOtherThanLC: AnswerOption;
  wasThisCoD: AnswerOption;
  otherCoDPresent: AnswerOption;
  otherCoDDirectResultOfLC: AnswerOption;
  lcContributingFactor: AnswerOption;
}

type QuestionKey = keyof AnswersState;

type ClassificationType = 
  | 'definitely_lc_death'
  | 'probable_lc_death'
  | 'possible_lc_death'
  | 'unlikely_lc_death'
  | 'definitely_no_lc_death'
  | 'intercurrent_cod_lc_contributory'
  | 'not_enough_information'
  | null;

interface QuestionDefinition {
  text: string;
  options: AnswerOption[];
}

interface QuestionsMap {
  [key: string]: QuestionDefinition;
}

interface NextStep {
  type: 'question' | 'classification';
  value: string;
}

const LungCancerClassifier: React.FC = () => {
  // State to track answers to the decision tree questions
  const [answers, setAnswers] = useState<AnswersState>({
    interventionDeath: null,
    interventionForLC: null,
    metastasisEvidence: null,
    tumorEvidence: null,
    paraneoplasticEvidence: null,
    clearCauseOtherThanLC: null,
    wasThisCoD: null,
    otherCoDPresent: null,
    otherCoDDirectResultOfLC: null,
    lcContributingFactor: null
  });

  // State to track which question is currently displayed
  const [currentQuestion, setCurrentQuestion] = useState<QuestionKey>('interventionDeath');
  
  // State to track the final classification result
  const [classification, setClassification] = useState<ClassificationType>(null);
  
  // Reset the form to start over
  const resetForm = () => {
    setAnswers({
      interventionDeath: null,
      interventionForLC: null,
      metastasisEvidence: null,
      tumorEvidence: null,
      paraneoplasticEvidence: null,
      clearCauseOtherThanLC: null,
      wasThisCoD: null,
      otherCoDPresent: null,
      otherCoDDirectResultOfLC: null,
      lcContributingFactor: null
    });
    setCurrentQuestion('interventionDeath');
    setClassification(null);
  };

  // Handle answering a question
  const handleAnswer = (question: QuestionKey, answer: AnswerOption) => {
    const newAnswers = { ...answers, [question]: answer };
    setAnswers(newAnswers);
    
    // Determine the next question or classification based on the current question and answer
    const nextStep = getNextStep(question, answer, newAnswers);
    
    if (nextStep.type === 'question') {
      setCurrentQuestion(nextStep.value as QuestionKey);
    } else if (nextStep.type === 'classification') {
      setClassification(nextStep.value as ClassificationType);
    }
  };

  // Logic to determine the next question or final classification
  const getNextStep = (currentQ: QuestionKey, answer: AnswerOption, currentAnswers: AnswersState): NextStep => {
    // Decision tree logic based on the flowchart
    switch (currentQ) {
      case 'interventionDeath':
        if (answer === 'yes') {
          return { type: 'question', value: 'interventionForLC' };
        } else if (answer === 'no') {
          return { type: 'question', value: 'metastasisEvidence' };
        } else if (answer === 'doubt') {
          return { type: 'classification', value: 'possible_lc_death' };
        } else {
          return { type: 'classification', value: 'not_enough_information' };
        }
      
      case 'interventionForLC':
        if (answer === 'yes') {
          return { type: 'classification', value: 'definitely_lc_death' };
        } else if (answer === 'no') {
          return { type: 'question', value: 'lcContributingFactor' };
        } else if (answer === 'doubt') {
          return { type: 'classification', value: 'possible_lc_death' };
        } else {
          return { type: 'classification', value: 'not_enough_information' };
        }
      
      case 'metastasisEvidence':
        if (answer === 'yes') {
          return { type: 'question', value: 'wasThisCoD' };
        } else if (answer === 'no') {
          return { type: 'question', value: 'tumorEvidence' };
        } else {
          return { type: 'question', value: 'tumorEvidence' };
        }

      case 'tumorEvidence':
        if (answer === 'yes') {
          return { type: 'question', value: 'wasThisCoD' };
        } else if (answer === 'no') {
          return { type: 'question', value: 'paraneoplasticEvidence' };
        } else {
          return { type: 'question', value: 'paraneoplasticEvidence' };
        }

      case 'paraneoplasticEvidence':
        if (answer === 'yes') {
          return { type: 'question', value: 'wasThisCoD' };
        } else if (answer === 'no') {
          return { type: 'question', value: 'clearCauseOtherThanLC' };
        } else {
          return { type: 'question', value: 'clearCauseOtherThanLC' };
        }

      case 'clearCauseOtherThanLC':
        if (answer === 'yes') {
          return { type: 'question', value: 'otherCoDDirectResultOfLC' };
        } else if (answer === 'no') {
          return { type: 'classification', value: 'unlikely_lc_death' };
        } else {
          return { type: 'classification', value: 'unlikely_lc_death' };
        }

      case 'wasThisCoD':
        if (answer === 'yes') {
          return { type: 'classification', value: 'definitely_lc_death' };
        } else if (answer === 'no') {
          return { type: 'question', value: 'otherCoDPresent' };
        } else if (answer === 'doubt') {
          return { type: 'question', value: 'otherCoDPresent' };
        } else {
          return { type: 'classification', value: 'not_enough_information' };
        }

      case 'otherCoDPresent':
        if (answer === 'yes') {
          return { type: 'question', value: 'otherCoDDirectResultOfLC' };
        } else if (answer === 'no') {
          return { type: 'question', value: 'lcContributingFactor' };
        } else if (answer === 'doubt') {
          return { type: 'classification', value: currentAnswers.metastasisEvidence === 'yes' ? 'probable_lc_death' : (currentAnswers.tumorEvidence === 'yes' ? 'unlikely_lc_death' : 'possible_lc_death') };
        } else {
          return { type: 'classification', value: 'not_enough_information' };
        }

      case 'otherCoDDirectResultOfLC':
        if (answer === 'yes') {
          return { type: 'classification', value: 'definitely_lc_death' };
        } else if (answer === 'no') {
          // This branch varies depending on metastasis/tumor/paraneoplastic
          if (currentAnswers.metastasisEvidence === 'yes') {
            return { type: 'classification', value: 'probable_lc_death' };
          } else if (currentAnswers.tumorEvidence === 'yes') {
            return { type: 'classification', value: 'unlikely_lc_death' };
          } else if (currentAnswers.paraneoplasticEvidence === 'yes') {
            return { type: 'classification', value: 'possible_lc_death' };
          } else {
            return { type: 'classification', value: 'unlikely_lc_death' };
          }
        } else if (answer === 'doubt') {
          return { type: 'classification', value: currentAnswers.metastasisEvidence === 'yes' ? 'probable_lc_death' : (currentAnswers.tumorEvidence === 'yes' ? 'unlikely_lc_death' : 'possible_lc_death') };
        } else {
          return { type: 'classification', value: 'not_enough_information' };
        }

      case 'lcContributingFactor':
        if (answer === 'yes') {
          return { type: 'classification', value: 'intercurrent_cod_lc_contributory' };
        } else if (answer === 'no') {
          return { type: 'classification', value: 'definitely_no_lc_death' };
        } else if (answer === 'doubt') {
          return { type: 'classification', value: 'intercurrent_cod_lc_contributory' };
        } else {
          return { type: 'classification', value: 'not_enough_information' };
        }

      default:
        return { type: 'question', value: 'interventionDeath' };
    }
  };

  // Questions definitions with their text
  const questions: QuestionsMap = {
    interventionDeath: {
      text: "1. Death as a result of an intervention for lung cancer?",
      options: ['yes', 'no', 'doubt', 'not_enough_information']
    },
    interventionForLC: {
      text: "Was the intervention for lung cancer?",
      options: ['yes', 'no', 'doubt', 'not_enough_information']
    },
    metastasisEvidence: {
      text: "2. Evidence for progressive, recurrent or new metastasis present?",
      options: ['yes', 'no']
    },
    tumorEvidence: {
      text: "3. Evidence for progressive, recurrent or second primary tumour present?",
      options: ['yes', 'no']
    },
    paraneoplasticEvidence: {
      text: "4. Evidence for paraneoplastic syndrome present?",
      options: ['yes', 'no']
    },
    clearCauseOtherThanLC: {
      text: "5. Clear cause of death present, other than lung cancer?",
      options: ['yes', 'no']
    },
    wasThisCoD: {
      text: "Was this the cause of death?",
      options: ['yes', 'no', 'doubt', 'not_enough_information']
    },
    otherCoDPresent: {
      text: "Other clear CoD present?",
      options: ['yes', 'no', 'doubt', 'not_enough_information']
    },
    otherCoDDirectResultOfLC: {
      text: "Other CoD direct result of lung cancer?",
      options: ['yes', 'no', 'doubt', 'not_enough_information']
    },
    lcContributingFactor: {
      text: "Lung cancer contributing factor?",
      options: ['yes', 'no', 'doubt', 'not_enough_information']
    }
  };

  // Classification result descriptions
  const classificationDescriptions: Record<string, string> = {
    definitely_lc_death: "Definitely LC death",
    probable_lc_death: "Probable LC death",
    possible_lc_death: "Possible LC death",
    unlikely_lc_death: "Unlikely LC death",
    definitely_no_lc_death: "Definitely no LC death",
    intercurrent_cod_lc_contributory: "Intercurrent CoD, LC contributory",
    not_enough_information: "Not enough information available"
  };

  // Format option text for display
  const formatOption = (option: AnswerOption): string => {
    switch (option) {
      case 'yes': return 'Yes';
      case 'no': return 'No';
      case 'doubt': return 'Doubt';
      case 'not_enough_information': return 'Not enough information available';
      default: return '';
    }
  };

  // Determine the appropriate button color based on option
  const getButtonColor = (option: AnswerOption): string => {
    switch (option) {
      case 'yes': return 'bg-green-500 hover:bg-green-600';
      case 'no': return 'bg-red-500 hover:bg-red-600';
      case 'doubt': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'not_enough_information': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  // Get classification result color
  const getClassificationColor = (classification: ClassificationType): string => {
    switch (classification) {
      case 'definitely_lc_death': return 'bg-red-700 text-white';
      case 'probable_lc_death': return 'bg-red-500 text-white';
      case 'possible_lc_death': return 'bg-yellow-500 text-black';
      case 'unlikely_lc_death': return 'bg-green-500 text-white';
      case 'definitely_no_lc_death': return 'bg-green-700 text-white';
      case 'intercurrent_cod_lc_contributory': return 'bg-blue-500 text-white';
      case 'not_enough_information': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Lung Cancer Cause of Death Classification Tool</h1>
      
      {!classification ? (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{questions[currentQuestion].text}</h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {questions[currentQuestion].options.map((option) => (
                <button
                  key={option}
                  className={`${getButtonColor(option)} text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200`}
                  onClick={() => handleAnswer(currentQuestion, option)}
                >
                  {formatOption(option)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Progress tracker */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Current decision path:</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(answers).filter(([_, value]) => value !== null).map(([key, value]) => (
                <div key={key} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="font-medium mr-1">{questions[key]?.text.split('?')[0]}?</span>
                  <span className="text-gray-600">{formatOption(value as AnswerOption)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`p-6 rounded-lg text-center ${getClassificationColor(classification)}`}>
            <h2 className="text-2xl font-bold mb-2">Classification Result</h2>
            <p className="text-xl">{classificationDescriptions[classification]}</p>
          </div>
          
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Decision path:</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(answers).filter(([_, value]) => value !== null).map(([key, value]) => (
                <div key={key} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="font-medium mr-1">{questions[key]?.text.split('?')[0]}?</span>
                  <span className="text-gray-600">{formatOption(value as AnswerOption)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button
            className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
            onClick={resetForm}
          >
            Start Over
          </button>
        </div>
      )}
      
      <div className="mt-10 text-center text-sm text-gray-500">
        <p>Based on the lung cancer death classification algorithm from</p>
        <p>
            Horeweg, Nanda, et al. <a href="https://doi.org/10.1016/j.lungcan.2012.04.018">"Blinded and uniform cause of death verification in a lung cancer CT screening trial."</a> <i>Lung Cancer</i> 77.3 (2012): 522-525.</p>
      </div>
    </div>
  );
};

export default LungCancerClassifier;