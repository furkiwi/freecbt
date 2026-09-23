import React from "react";
import { Keyboard, ScrollView, TextInput, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { CarouselRenderItemInfo } from "react-native-reanimated-carousel/lib/typescript/types";
import i18n from "../i18n";
import * as Distortion from "../io-ts/distortion";
import { ThoughtRecordMode } from "../setting/thought-record-mode";
import { ActionButton, Paragraph, SubHeader } from "../ui";
import AlternativeThought from "./AlternativeThought";
import AutomaticThought from "./AutomaticThought";
import Challenge from "./Challenge";
import Distortions from "./Distortions";
import IntensityPicker from "./IntensityPicker";
import { sliderHeight, sliderWidth } from "./sizes";
import {
  textInputPlaceholderColor,
  textInputStyle,
} from "./textInputStyle";

export const simpleSlides = [
  "automatic",
  "distortions",
  "challenge",
  "alternative",
] as const;
export const fullSlides = [
  "situation",
  "automatic",
  "distortions",
  "evidence",
  "alternative",
] as const;

export type Slides =
  | (typeof simpleSlides)[number]
  | (typeof fullSlides)[number];

export function slidesForMode(mode: ThoughtRecordMode): readonly Slides[] {
  return mode === "full" ? fullSlides : simpleSlides;
}

export type FormRecord = {
  situation: string;
  emotion: string;
  emotionIntensity: number | null;
  automatic: string;
  automaticBelief: number | null;
  alternative: string;
  alternativeBelief: number | null;
  challenge: string;
  evidenceFor: string;
  distortions: Set<Distortion.Distortion>;
  emotionIntensityAfter: number | null;
};

interface FormViewProps {
  mode: ThoughtRecordMode;
  onSave: () => void;
  record: FormRecord;
  slideToShow: Slides;
  shouldShowInFlowOnboarding: boolean;
  onChange: (patch: Partial<FormRecord>) => void;
  onChangeDistortion: (selected: string) => void;
}

export default function FormView(props: FormViewProps): React.JSX.Element {
  const slides = slidesForMode(props.mode);
  const defaultIndex = Math.max(0, slides.indexOf(props.slideToShow));

  function _renderItem(item: CarouselRenderItemInfo<Slides>): React.JSX.Element {
    switch (item.item) {
      case "situation":
        return (
          <ScrollView>
            <SubHeader style={{ marginBottom: 6 }}>
              {i18n.t("cbt_form.situation")}
            </SubHeader>
            <Paragraph style={{ marginBottom: 12 }}>
              {i18n.t("cbt_form.situation_description")}
            </Paragraph>
            <TextInput
              style={{ ...textInputStyle, height: 110 }}
              placeholderTextColor={textInputPlaceholderColor}
              placeholder={i18n.t("cbt_form.situation_placeholder")}
              value={props.record.situation}
              multiline={true}
              numberOfLines={4}
              onChangeText={(situation) => props.onChange({ situation })}
            />
            <SubHeader style={{ marginTop: 16, marginBottom: 6 }}>
              {i18n.t("cbt_form.emotion")}
            </SubHeader>
            <Paragraph style={{ marginBottom: 12 }}>
              {i18n.t("cbt_form.emotion_description")}
            </Paragraph>
            <TextInput
              style={{ ...textInputStyle, height: 72 }}
              placeholderTextColor={textInputPlaceholderColor}
              placeholder={i18n.t("cbt_form.emotion_placeholder")}
              value={props.record.emotion}
              multiline={false}
              onChangeText={(emotion) => props.onChange({ emotion })}
            />
            <View style={{ marginTop: 12 }}>
              <IntensityPicker
                label={i18n.t("cbt_form.emotion_intensity")}
                value={props.record.emotionIntensity}
                onChange={(emotionIntensity) =>
                  props.onChange({ emotionIntensity })
                }
              />
            </View>
          </ScrollView>
        );
      case "automatic":
        return (
          <ScrollView>
            <AutomaticThought
              value={props.record.automatic}
              onChange={(automatic) => props.onChange({ automatic })}
            />
            {props.mode === "full" ? (
              <View style={{ marginTop: 16 }}>
                <IntensityPicker
                  label={i18n.t("cbt_form.belief")}
                  value={props.record.automaticBelief}
                  onChange={(automaticBelief) =>
                    props.onChange({ automaticBelief })
                  }
                />
              </View>
            ) : null}
          </ScrollView>
        );
      case "distortions":
        return (
          <Distortions
            selected={props.record.distortions}
            onChange={props.onChangeDistortion}
          />
        );
      case "challenge":
        return (
          <ScrollView>
            <Challenge
              value={props.record.challenge}
              onChange={(challenge) => props.onChange({ challenge })}
            />
          </ScrollView>
        );
      case "evidence":
        return (
          <ScrollView>
            <SubHeader style={{ marginBottom: 6 }}>
              {i18n.t("cbt_form.evidence_for")}
            </SubHeader>
            <TextInput
              style={{ ...textInputStyle, height: 110, backgroundColor: "white" }}
              placeholderTextColor={textInputPlaceholderColor}
              placeholder={i18n.t("cbt_form.evidence_for_placeholder")}
              value={props.record.evidenceFor}
              multiline={true}
              numberOfLines={4}
              onChangeText={(evidenceFor) => props.onChange({ evidenceFor })}
            />
            <SubHeader style={{ marginTop: 16, marginBottom: 6 }}>
              {i18n.t("cbt_form.evidence_against")}
            </SubHeader>
            <TextInput
              style={{ ...textInputStyle, height: 110, backgroundColor: "white" }}
              placeholderTextColor={textInputPlaceholderColor}
              placeholder={i18n.t("cbt_form.evidence_against_placeholder")}
              value={props.record.challenge}
              multiline={true}
              numberOfLines={4}
              onChangeText={(challenge) => props.onChange({ challenge })}
            />
          </ScrollView>
        );
      case "alternative":
        return (
          <ScrollView>
            <AlternativeThought
              value={props.record.alternative}
              onChange={(alternative) => props.onChange({ alternative })}
            />
            {props.mode === "full" ? (
              <>
                <View style={{ marginTop: 16 }}>
                  <IntensityPicker
                    label={i18n.t("cbt_form.belief_after")}
                    value={props.record.alternativeBelief}
                    onChange={(alternativeBelief) =>
                      props.onChange({ alternativeBelief })
                    }
                  />
                </View>
                <IntensityPicker
                  label={i18n.t("cbt_form.emotion_after")}
                  value={props.record.emotionIntensityAfter}
                  onChange={(emotionIntensityAfter) =>
                    props.onChange({ emotionIntensityAfter })
                  }
                />
              </>
            ) : null}
            <View style={{ marginTop: 12, marginBottom: 24 }}>
              <ActionButton
                title={i18n.t("cbt_form.submit")}
                width="100%"
                onPress={props.onSave}
              />
            </View>
          </ScrollView>
        );
      default:
        return <View />;
    }
  }

  return (
    <View style={{ width: sliderWidth, overflow: "hidden" }}>
      <Carousel
        key={props.mode}
        data={[...slides]}
        renderItem={_renderItem}
        width={sliderWidth}
        height={sliderHeight}
        onSnapToItem={() => {
          Keyboard.dismiss();
        }}
        loop={false}
        defaultIndex={defaultIndex}
        onConfigurePanGesture={(gesture) => {
          "worklet";
          gesture.activeOffsetX([-10, 10]);
        }}
      />
    </View>
  );
}
