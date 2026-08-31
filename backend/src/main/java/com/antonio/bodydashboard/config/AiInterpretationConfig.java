package com.antonio.bodydashboard.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import com.antonio.bodydashboard.service.ai.AiInterpretationProvider;
import com.antonio.bodydashboard.service.ai.NoopAiInterpretationProvider;
import com.antonio.bodydashboard.service.ai.OpenAiCompatibleAiInterpretationProvider;
import tools.jackson.databind.ObjectMapper;

@Configuration
@EnableConfigurationProperties(AiInterpretationProperties.class)
public class AiInterpretationConfig {

    @Bean
    @ConditionalOnMissingBean(AiInterpretationProvider.class)
    @ConditionalOnProperty(prefix = "body-dashboard.ai.interpretation", name = "provider", havingValue = "none", matchIfMissing = true)
    NoopAiInterpretationProvider noopAiInterpretationProvider() {
        return new NoopAiInterpretationProvider();
    }

    @Bean
    @ConditionalOnProperty(prefix = "body-dashboard.ai.interpretation", name = "provider", havingValue = "openai-compatible")
    OpenAiCompatibleAiInterpretationProvider openAiCompatibleAiInterpretationProvider(
            AiInterpretationProperties properties,
            ObjectMapper objectMapper) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(properties.getTimeout());
        requestFactory.setReadTimeout(properties.getTimeout());

        RestClient restClient = RestClient.builder()
                .baseUrl(trimTrailingSlash(properties.getBaseUrl().toString()))
                .requestFactory(requestFactory)
                .defaultHeader("Authorization", "Bearer " + properties.getApiKey())
                .build();

        return new OpenAiCompatibleAiInterpretationProvider(properties, restClient, objectMapper);
    }

    private String trimTrailingSlash(String value) {
        if (value.endsWith("/")) {
            return value.substring(0, value.length() - 1);
        }
        return value;
    }
}
