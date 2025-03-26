import React, { useState } from 'react';

// Define types for our state
type AnswerOption = 'yes' | 'no' | 'doubt' | 'not_enough_information' | null;

interface AnswersState {
  interventionDeath: AnswerOption;
  interventionForLC: AnswerOption;
  metastasisEvidence: AnswerOption;
  metastasisLC: AnswerOption;
  tumourEvidence: AnswerOption;
  tumourLC: AnswerOption;
  paraneoplasticEvidence: AnswerOption;
  paraneoplasticLC: AnswerOption;
  clearCauseOtherThanLC: AnswerOption;
  wasThisCoD: AnswerOption;
  otherCoDPresent3: AnswerOption;
  otherCoDPresent4: AnswerOption;
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

// Define a history item type to track the user's path
interface HistoryItem {
  question: QuestionKey;
  answer: AnswerOption;
}

const LungCancerClassifier: React.FC = () => {
  // State to track answers to the decision tree questions
  const [answers, setAnswers] = useState<AnswersState>({
    interventionDeath: null,
    interventionForLC: null,
    metastasisEvidence: null,
    metastasisLC: null,
    tumourEvidence: null,
    tumourLC: null,
    paraneoplasticEvidence: null,
    paraneoplasticLC: null,
    clearCauseOtherThanLC: null,
    wasThisCoD: null,
    otherCoDPresent3: null,
    otherCoDPresent4: null,
    otherCoDDirectResultOfLC: null,
    lcContributingFactor: null
  });

  // State to track which question is currently displayed
  const [currentQuestion, setCurrentQuestion] = useState<QuestionKey>('interventionDeath');
  
  // State to track the final classification result
  const [classification, setClassification] = useState<ClassificationType>(null);
  
  // State to track the history of questions and answers
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Reset the form to start over
  const resetForm = () => {
    setAnswers({
      interventionDeath: null,
      interventionForLC: null,
      metastasisEvidence: null,
      metastasisLC: null,
      tumourEvidence: null,
      tumourLC: null,
      paraneoplasticEvidence: null,
      paraneoplasticLC: null,
      clearCauseOtherThanLC: null,
      wasThisCoD: null,
      otherCoDPresent3: null,
      otherCoDPresent4: null,
      otherCoDDirectResultOfLC: null,
      lcContributingFactor: null
    });
    setCurrentQuestion('interventionDeath');
    setClassification(null);
    setHistory([]);
  };

  // Handle going back to the previous question
  const handleGoBack = () => {
    if (history.length === 0) return;
    
    // Get the last item from history
    const newHistory = [...history];
    const lastItem = newHistory.pop();
    
    if (!lastItem) return;
    
    // Create a new answers object with the last answer removed
    const newAnswers = { ...answers };
    newAnswers[lastItem.question] = null;
    
    // If we're going back from a classification result, clear it
    setClassification(null);
    
    // Set the current question to the question we're going back to
    setCurrentQuestion(lastItem.question);
    
    // Update state
    setAnswers(newAnswers);
    setHistory(newHistory);
  };

  // Handle answering a question
  const handleAnswer = (question: QuestionKey, answer: AnswerOption) => {
    // Update history
    setHistory([...history, { question, answer }]);
    
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
        } else {
          // The diagram only shows yes/no for this question
          return { type: 'question', value: 'metastasisEvidence' };
        }
      
      case 'interventionForLC':
        if (answer === 'yes') {
          return { type: 'classification', value: 'definitely_lc_death' };
        } else if (answer === 'no') {
          return { type: 'question', value: 'lcContributingFactor' };
        } else if (answer === 'doubt') {
          return { type: 'classification', value: 'possible_lc_death' };
        } else { // not_enough_information
          return { type: 'classification', value: 'possible_lc_death' };
        }
      
      case 'metastasisEvidence':
        if (answer === 'yes') {
          return { type: 'question', value: 'metastasisLC' };
        } else if (answer === 'no') {
          return { type: 'question', value: 'tumourEvidence' };
        } else {
          return { type: 'question', value: 'tumourEvidence' };
        }

      case 'metastasisLC':
        if (answer === 'yes') {
          return { type: 'question', value: 'wasThisCoD' };
        } else if (answer === 'no') {
          return { type: 'question', value: 'wasThisCoD' };
        } else if (answer === 'doubt') {
          return { type: 'question', value: 'wasThisCoD' };
        } else { // not_enough_information
          return { type: 'question', value: 'wasThisCoD' };
        }

      case 'tumourEvidence':
        if (answer === 'yes') {
          return { type: 'question', value: 'tumourLC' };
        } else if (answer === 'no') {
          return { type: 'question', value: 'paraneoplasticEvidence' };
        } else {
          return { type: 'question', value: 'paraneoplasticEvidence' };
        }

      case 'tumourLC':
        if (answer === 'yes') {
          return { type: 'question', value: 'wasThisCoD' };
        } else if (answer === 'no') {
          return { type: 'question', value: 'wasThisCoD' };
        } else if (answer === 'doubt') {
          return { type: 'question', value: 'wasThisCoD' };
        } else { // not_enough_information
          return { type: 'question', value: 'wasThisCoD' };
        }

      case 'paraneoplasticEvidence':
        if (answer === 'yes') {
          return { type: 'question', value: 'paraneoplasticLC' };
        } else if (answer === 'no') {
          return { type: 'question', value: 'clearCauseOtherThanLC' };
        } else {
          return { type: 'question', value: 'clearCauseOtherThanLC' };
        }

        case 'paraneoplasticLC':
          if (answer === 'yes') {
            return { type: 'question', value: 'wasThisCoD' };
          } else if (answer === 'no') {
            return { type: 'question', value: 'wasThisCoD' };
          } else if (answer === 'doubt') {
            return { type: 'question', value: 'wasThisCoD' };
          } else { // not_enough_information
            return { type: 'question', value: 'wasThisCoD' };
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
          // depends how we got here
          // if metastasisLC, tumourEvidence, or paraneoplasticEvidence was yes
          // then definitely_lc_death
          if (currentAnswers.metastasisLC === 'yes' || currentAnswers.tumourLC === 'yes' || currentAnswers.paraneoplasticLC === 'yes') {
            return { type: 'classification', value: 'definitely_lc_death' };
          } else if (currentAnswers.metastasisLC === 'no' || currentAnswers.tumourLC === 'no' || currentAnswers.paraneoplasticLC === 'no') {
            return { type: 'question', value: 'lcContributingFactor' };
          } else if (currentAnswers.metastasisLC === 'doubt' || currentAnswers.tumourLC === 'doubt' || currentAnswers.paraneoplasticLC === 'doubt') {
            return { type: 'classification', value: 'possible_lc_death' };
          } else {
            return { type: 'classification', value: 'possible_lc_death' };
          }
        } 
        // else if answers are doubt, no or not enough info, and metastasisLC, tumourEvidence, or paraneoplasticEvidence was no
        // then ask otherCoDPresent3
        else {
          if (currentAnswers.metastasisLC === 'no' || currentAnswers.tumourLC === 'no' || currentAnswers.paraneoplasticLC === 'no') {
            return { type: 'question', value: 'otherCoDPresent3' };
          }
          else { // else ask otherCoDPresent4
            return { type: 'question', value: 'otherCoDPresent4' };
          }
        }

      case 'otherCoDPresent3':
        if (answer === 'yes') {
          // if yes, ask if other CoD direct result of LC
          return { type: 'question', value: 'otherCoDDirectResultOfLC' };
        } else if (answer === 'no') {
          // if no, depends on how we got here
          // if metastasisLC, tumourEvidence, or paraneoplasticEvidence was yes, then probable_lc_death
          if (currentAnswers.metastasisLC === 'yes' || currentAnswers.tumourLC === 'yes' || currentAnswers.paraneoplasticLC === 'yes') {
            return { type: 'classification', value: 'probable_lc_death' };
            // if metastasisLC, tumourEvidence, or paraneoplasticEvidence was no, then unlikely_lc_death
          } else if (currentAnswers.metastasisLC === 'no' || currentAnswers.tumourLC === 'no' || currentAnswers.paraneoplasticLC === 'no') {
            return { type: 'classification', value: 'unlikely_lc_death' };
            // if doubt or not enough info for metastasisLC, tumourEvidence, or paraneoplasticEvidence, then possible_lc_death
          } else { // only remaining option is doubt or not enough info
            return { type: 'classification', value: 'possible_lc_death' };
          }
        } 
        // besides yes and no, other CoD answers are doubt or not enough info
        // follows the same path as no
        else {
          // if no, depends on how we got here
          // if metastasisLC, tumourEvidence, or paraneoplasticEvidence was yes, then probable_lc_death
          if (currentAnswers.metastasisLC === 'yes' || currentAnswers.tumourLC === 'yes' || currentAnswers.paraneoplasticLC === 'yes') {
            return { type: 'classification', value: 'probable_lc_death' };
            // if metastasisLC, tumourEvidence, or paraneoplasticEvidence was no, then unlikely_lc_death
          } else if (currentAnswers.metastasisLC === 'no' || currentAnswers.tumourLC === 'no' || currentAnswers.paraneoplasticLC === 'no') {
            return { type: 'classification', value: 'unlikely_lc_death' };
            // if doubt or not enough info for metastasisLC, tumourEvidence, or paraneoplasticEvidence, then possible_lc_death
          } else { 
            return { type: 'classification', value: 'possible_lc_death' };
          }
        } 

        // single question for the 4 answer option of otherCoDPresent
        case 'otherCoDPresent4':
          if (answer === 'yes') {
            // if yes, ask if other CoD direct result of LC
            return { type: 'question', value: 'otherCoDDirectResultOfLC' };
          } else {
            return { type: 'classification', value: 'possible_lc_death' };
          }


      case 'otherCoDDirectResultOfLC':
        if (answer === 'yes') {
          return { type: 'classification', value: 'definitely_lc_death' };
        } else if (answer === 'no') {
          return { type: 'question', value: 'lcContributingFactor' };
        } else if (answer === 'doubt') {
          return { type: 'question', value: 'lcContributingFactor' };
        } else { // not_enough_information
          return { type: 'question', value: 'lcContributingFactor' };
        }

      case 'lcContributingFactor':
        if (answer === 'yes') {
          return { type: 'classification', value: 'intercurrent_cod_lc_contributory' };
        } else if (answer === 'no') {
          return { type: 'classification', value: 'definitely_no_lc_death' };
        } else if (answer === 'doubt') {
          return { type: 'classification', value: 'definitely_no_lc_death' };
        } else { // not_enough_information
          // According to flowchart, not_enough_info follows same path as doubt
          return { type: 'classification', value: 'definitely_no_lc_death' };
        }

      default:
        return { type: 'question', value: 'interventionDeath' };
    }
  };

  // Questions definitions with their text
  const questions: QuestionsMap = {
    interventionDeath: {
      text: "1. Death as a result of an intervention?",
      options: ['yes', 'no']
    },
    interventionForLC: {
      text: "Was the intervention for lung cancer?",
      options: ['yes', 'no', 'doubt', 'not_enough_information']
    },
    metastasisEvidence: {
      text: "2. Evidence for progressive, recurrent or new metastasis present?",
      options: ['yes', 'no']
    },
    metastasisLC: {
      text: "Was the metastasis lung cancer?",
      options: ['yes', 'no', 'doubt', 'not_enough_information']
    },
    tumourEvidence: {
      text: "3. Evidence for progressive, recurrent or second primary tumour present?",
      options: ['yes', 'no']
    },
    tumourLC: {
      text: "Was the tumour lung cancer?",
      options: ['yes', 'no', 'doubt', 'not_enough_information']
    },
    paraneoplasticEvidence: {
      text: "4. Evidence for paraneoplastic syndrome present?",
      options: ['yes', 'no']
    },
    paraneoplasticLC: {
      text: "Paraneoplastic syndrome result of lung cancer?",
      options: ['yes', 'no', 'doubt', 'not_enough_information']
    },
    clearCauseOtherThanLC: {
      text: "5. Clear cause of death present, other than lung cancer?",
      options: ['yes', 'no']
    },
    wasThisCoD: {
      text: "Was this the cause of death?",
      options: ['yes', 'no', 'doubt', 'not_enough_information']
    },
    otherCoDPresent3: {
      text: "Other clear CoD present?",
      options: ['yes', 'no', 'not_enough_information']
    },
    otherCoDPresent4: {
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
    intercurrent_cod_lc_contributory: "Intercurrent CoD, LC contributory"
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
      <h1 className="text-2xl font-bold mb-6 text-left">Lung Cancer Cause of Death Classification Tool</h1>
      
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
            
            {/* Back button */}
            {history.length > 0 && (
              <button
                className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center"
                onClick={handleGoBack}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
              </button>
            )}
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
            <h2 className="text-xl mb-2">Classification Result</h2>
            <p className="text-2xl font-bold">{classificationDescriptions[classification]}</p>
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
          
          {/* Back button when viewing result */}
          {history.length > 0 && (
            <button
              className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center"
              onClick={handleGoBack}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
          )}
          
          <button
            className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
            onClick={resetForm}
          >
            Start Over
          </button>
        </div>
      )}
      
      <div className="mt-10 text-left text-sm text-gray-500">
      <p>This web app adapted by Daryl Cheng, March 2025, based on the lung cancer related death classification algorithm from:</p>
      <p>Horeweg, Nanda, et al. <a href="https://doi.org/10.1016/j.lungcan.2012.04.018">"Blinded and uniform cause of death verification in a lung cancer CT screening trial."</a> <i>Lung Cancer</i> 77.3 (2012): 522-525.</p>
      </div>
    </div>
  );
};

export default LungCancerClassifier;