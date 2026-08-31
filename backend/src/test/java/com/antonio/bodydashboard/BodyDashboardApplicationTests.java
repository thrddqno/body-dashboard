package com.antonio.bodydashboard;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.SpringBootApplication;

class BodyDashboardApplicationTests {

	@Test
	void applicationClassIsSpringBootApplication() {
		assertThat(BodyDashboardApplication.class)
				.hasAnnotation(SpringBootApplication.class);
	}
}
