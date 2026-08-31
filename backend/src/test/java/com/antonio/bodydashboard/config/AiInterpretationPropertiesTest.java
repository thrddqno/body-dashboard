package com.antonio.bodydashboard.config;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.URI;
import java.time.Duration;

import org.junit.jupiter.api.Test;

class AiInterpretationPropertiesTest {

    @Test
    void noneProviderDoesNotRequireApiKeyOrModel() {
        AiInterpretationProperties properties = new AiInterpretationProperties();
        properties.setProvider(AiInterpretationProperties.Provider.NONE);
        properties.setApiKey("");
        properties.setModel("");

        assertThatCode(properties::validate).doesNotThrowAnyException();
    }

    @Test
    void openAiCompatibleProviderRequiresApiKey() {
        AiInterpretationProperties properties = validOpenAiCompatibleProperties();
        properties.setApiKey("");

        assertThatThrownBy(properties::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("API key is required");
    }

    @Test
    void openAiCompatibleProviderRequiresModel() {
        AiInterpretationProperties properties = validOpenAiCompatibleProperties();
        properties.setModel("");

        assertThatThrownBy(properties::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("model is required");
    }

    @Test
    void openAiCompatibleProviderRequiresHttpsBaseUrl() {
        AiInterpretationProperties properties = validOpenAiCompatibleProperties();
        properties.setBaseUrl(URI.create("http://api.example.test/v1"));

        assertThatThrownBy(properties::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("must use HTTPS");
    }

    @Test
    void timeoutMustBePositive() {
        AiInterpretationProperties properties = new AiInterpretationProperties();
        properties.setTimeout(Duration.ZERO);

        assertThatThrownBy(properties::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("timeout must be greater than zero");
    }

    private AiInterpretationProperties validOpenAiCompatibleProperties() {
        AiInterpretationProperties properties = new AiInterpretationProperties();
        properties.setProvider(AiInterpretationProperties.Provider.OPENAI_COMPATIBLE);
        properties.setApiKey("test-api-key");
        properties.setModel("test-model");
        properties.setBaseUrl(URI.create("https://api.example.test/v1"));
        properties.setTimeout(Duration.ofSeconds(10));
        return properties;
    }
}
