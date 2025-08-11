import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import {
  createPullSequence,
  createAnticipationAnimation,
  createRarityRevealSequence,
  getRarityVisualConfig,
  createSkipAnimation,
} from './utils/PullAnimationUtils';
import {
  createCelebrationAnimation,
  createScreenFlash,
  createConfettiAnimation,
  getCelebrationMessage,
} from './utils/CelebrationUtils';
import {
  AnticipationStep,
  RevealStep,
  CelebrationStep,
  SkipButtons,
} from './components/PullSequenceSteps';

const { width, height } = Dimensions.get('window');

interface PullResult {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  character: string;
  isNew: boolean;
}

interface PullSequenceControllerProps {
  visible: boolean;
  pullResults: PullResult[];
  onComplete: () => void;
  onSkip: () => void;
  pullType: 'single' | 'multi';
}

const PullSequenceController: React.FC<PullSequenceControllerProps> = ({
  visible,
  pullResults,
  onComplete,
  onSkip,
  pullType,
}) => {
  const [currentStep, setCurrentStep] = useState<'anticipation' | 'reveal' | 'celebration' | 'complete'>('anticipation');
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  
  // Animation values
  const anticipationAnimation = useRef(new Animated.Value(0)).current;
  const revealAnimation = useRef(new Animated.Value(0)).current;
  const celebrationAnimation = useRef(new Animated.Value(0)).current;
  const skipAnimation = useRef(new Animated.Value(0)).current;
  const screenFlashAnimation = useRef(new Animated.Value(0)).current;
  
  const currentResult = pullResults[currentResultIndex];
  const isLastResult = currentResultIndex === pullResults.length - 1;
  
  useEffect(() => {
    if (visible && pullResults.length > 0) {
      startPullSequence();
    }
  }, [visible, pullResults]);
  
  const startPullSequence = () => {
    setCurrentStep('anticipation');
    setCurrentResultIndex(0);
    setCanSkip(false);
    
    const anticipation = createAnticipationAnimation(2000, () => {
      setCurrentStep('reveal');
      startRevealSequence();
    });
    
    setTimeout(() => setCanSkip(true), 1000);
  };
  
  const startRevealSequence = () => {
    if (!currentResult) return;
    
    const rarity = currentResult.rarity;
    const visualConfig = getRarityVisualConfig(rarity);
    
    const reveal = createRarityRevealSequence(rarity as any, () => {
      setCurrentStep('celebration');
      startCelebrationSequence();
    });
    
    if (rarity !== 'common') {
      createScreenFlash(visualConfig.glowColor, 500);
    }
  };
  
  const startCelebrationSequence = () => {
    if (!currentResult) return;
    
    const rarity = currentResult.rarity;
    
    const celebration = createCelebrationAnimation(
      {
        duration: rarity === 'legendary' ? 5000 : rarity === 'epic' ? 3000 : 2000,
        particleCount: rarity === 'legendary' ? 50 : rarity === 'epic' ? 35 : 20,
        colors: getRarityVisualConfig(rarity).colors,
        scale: getRarityVisualConfig(rarity).scale,
      },
      () => {
        if (isLastResult) {
          setCurrentStep('complete');
          setTimeout(onComplete, 1000);
        } else {
          setCurrentResultIndex(prev => prev + 1);
          setCurrentStep('anticipation');
          setTimeout(startPullSequence, 500);
        }
      }
    );
    
    if (rarity === 'legendary') {
      createConfettiAnimation(30, 3000);
    }
  };
  
  const handleSkip = () => {
    if (!canSkip) return;
    
    const skip = createSkipAnimation(() => {
      if (isLastResult) {
        onComplete();
      } else {
        setCurrentResultIndex(prev => prev + 1);
        setCurrentStep('anticipation');
        setTimeout(startPullSequence, 300);
      }
    });
  };
  
  const handleSkipAll = () => {
    if (!canSkip) return;
    onSkip();
  };
  
  const renderCurrentStep = () => {
    if (!currentResult) return null;
    
    const rarity = currentResult.rarity as 'rare' | 'epic' | 'legendary';
    const visualConfig = getRarityVisualConfig(rarity);
    const message = getCelebrationMessage(rarity, currentResult.name);
    
    switch (currentStep) {
      case 'anticipation':
        return <AnticipationStep animation={anticipationAnimation} />;
      case 'reveal':
        return <RevealStep result={currentResult} animation={revealAnimation} visualConfig={visualConfig} />;
      case 'celebration':
        return <CelebrationStep result={currentResult} animation={celebrationAnimation} message={message} />;
      default:
        return null;
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.screenFlash,
            {
              opacity: screenFlashAnimation,
              backgroundColor: currentResult ? 
                getRarityVisualConfig(currentResult.rarity as any).glowColor : 
                'transparent',
            },
          ]}
        />
        
        <View style={styles.content}>
          {renderCurrentStep()}
        </View>
        
        <SkipButtons
          canSkip={canSkip}
          animation={skipAnimation}
          onSkip={handleSkip}
          onSkipAll={handleSkipAll}
          pullType={pullType}
        />
        
        {pullType === 'multi' && pullResults.length > 1 && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentResultIndex + 1} / {pullResults.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenFlash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  progressContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  progressText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PullSequenceController; 