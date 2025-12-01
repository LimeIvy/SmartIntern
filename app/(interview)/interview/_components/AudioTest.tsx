'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mic, Volume2, CheckCircle, XCircle } from 'lucide-react'

interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: string;
}

interface AudioTestProps {
  onTestComplete?: (micWorking: boolean, speakerWorking: boolean) => void;
}

const AudioTest: React.FC<AudioTestProps> = ({ onTestComplete }) => {
  // デバイス一覧関連の状態
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>('');

  // マイクテスト関連の状態
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [micTesting, setMicTesting] = useState(false);
  const [micWorking, setMicWorking] = useState<boolean | null>(null);
  const [micVolume, setMicVolume] = useState(0);

  // スピーカーテスト関連の状態
  const [speakerTesting, setSpeakerTesting] = useState(false);
  const [speakerWorking, setSpeakerWorking] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // refs
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  // デバイス一覧を取得
  const loadDevices = async () => {
    try {
      // まず権限を取得
      await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioInputs = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `マイク ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));

      const audioOutputs = devices
        .filter(device => device.kind === 'audiooutput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `スピーカー ${device.deviceId.slice(0, 8)}`,
          kind: device.kind
        }));

      setAudioInputDevices(audioInputs);
      setAudioOutputDevices(audioOutputs);

      // デフォルトデバイスを選択
      if (audioInputs.length > 0 && !selectedMicId) {
        setSelectedMicId(audioInputs[0]?.deviceId || '');
      }
      if (audioOutputs.length > 0 && !selectedSpeakerId) {
        setSelectedSpeakerId(audioOutputs[0]?.deviceId || '');
      }

    } catch (error) {
      console.error('デバイス一覧の取得エラー:', error);
    }
  };

  // コンポーネントマウント時にデバイス一覧を取得
  useEffect(() => {
    loadDevices();
  }, []);

  // マイクテスト開始
  const startMicTest = async () => {
    try {
      setMicTesting(true);
      setMicPermission(null);

      const constraints = {
        audio: selectedMicId ? {
          deviceId: { exact: selectedMicId },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = stream;
      setMicPermission(true);

      // Web Audio APIでボリューム解析
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      microphone.connect(analyser);
      analyserRef.current = analyser;

      // ボリューム監視
      const checkVolume = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const volume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setMicVolume(volume);

        // 音が検出されたらマイクが動作していると判定
        if (volume > 10) {
          setMicWorking(true);
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();

    } catch (error) {
      console.error('マイクアクセスエラー:', error);
      setMicPermission(false);
      setMicWorking(false);
      setMicTesting(false);
    }
  };

  // マイクテスト停止
  const stopMicTest = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setMicTesting(false);
    setMicVolume(0);
  };

  // スピーカーテスト（選択されたデバイスでテスト）
  const testSpeakers = async () => {
    setSpeakerTesting(true);
    setIsPlaying(true);

    try {
      // Web Audio APIでテスト音を生成
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

      // 選択されたスピーカーでテスト音を再生
      if (selectedSpeakerId) {
        try {
          await (audioContext as unknown as { setSinkId: (id: string) => Promise<void> }).setSinkId(selectedSpeakerId);
        } catch (error) { 
          console.warn('選択されたスピーカーでの再生に失敗、デフォルトで再生:', error);
        }
      }

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 2);

      oscillator.onended = () => {
        setIsPlaying(false);
      };
    } catch (error) {
      console.error('スピーカーテストエラー:', error);
      setIsPlaying(false);
    }
  };

  // スピーカーテスト結果設定
  const setSpeakerTestResult = (working: boolean) => {
    setSpeakerWorking(working);
    setSpeakerTesting(false);
  };

  // テスト完了時のコールバック
  useEffect(() => {
    if (micWorking !== null && speakerWorking !== null && onTestComplete) {
      onTestComplete(micWorking, speakerWorking);
    }
  }, [micWorking, speakerWorking, onTestComplete]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      stopMicTest();
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      
      {/* マイクテスト */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            マイクテスト
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            {audioInputDevices.length > 0 ? (
              <Select value={selectedMicId} onValueChange={setSelectedMicId}>
                <SelectTrigger>
                  <SelectValue placeholder="マイクを選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {audioInputDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-red-600">
                マイクが検出されませんでした
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={micTesting ? stopMicTest : startMicTest}
              variant={micTesting ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              {micTesting ? "テスト停止" : "マイクテスト開始"}
            </Button>

            {micWorking !== null && (
              <div className="flex items-center gap-2">
                {micWorking ? (
                  <><CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600">マイク動作中</span></>
                ) : (
                  <><XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-600">マイクが検出されません</span></>
                )}
              </div>
            )}
          </div>

          {micTesting && (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                マイクに向かって話してください
              </div>

              {/* ボリューム表示 */}
              <div className="w-full bg-gray-200 rounded-lg h-4 overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-30"
                  style={{ width: `${Math.min(micVolume * 2, 100)}%` }}
                />
              </div>
            </div>
          )}

          {micPermission === false && (
            <div className="text-red-600 text-sm">
              マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。
    100      </div>
          )}
        </CardContent>
      </Card>

      {/* スピーカーテスト */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            スピーカーテスト
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            {audioOutputDevices.length > 0 ? (
              <Select value={selectedSpeakerId} onValueChange={setSelectedSpeakerId}>
                <SelectTrigger className="w-full truncate">
                  <SelectValue placeholder="スピーカーを選択してください" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  {audioOutputDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-red-600">
                スピーカーが検出されませんでした
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={testSpeakers}
              disabled={isPlaying}
              className="flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              {isPlaying ? "テスト音再生中..." : "テスト音を再生"}
            </Button>

            {speakerWorking !== null && (
              <div className="flex items-center gap-2">
                {speakerWorking ? (
                  <><CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600">スピーカー動作中</span></>
                ) : (
                  <><XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-600">音が聞こえませんでした</span></>
                )}
              </div>
            )}
          </div>

          {speakerTesting && !isPlaying && (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                テスト音が聞こえましたか？
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setSpeakerTestResult(true)}
                  variant="default"
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                >
                  ✓
                </Button>
                <Button
                  onClick={() => setSpeakerTestResult(false)}
                  variant="destructive"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioTest;